"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TopicSelector from "@/components/topic-selection";
import { sendTopicWebhook, type Topic } from "@/lib/topicWebhook";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  created_at: string;
}

interface ChatUsage {
  chat_count: number;
  chat_limit: number;
  is_premium: boolean;
}

export default function AIChat() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatUsage, setChatUsage] = useState<ChatUsage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchChatUsage();

    const channel = supabase
      .channel("chat_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          fetchMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChatUsage = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_usage")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching chat usage:", error);
        throw error;
      }

      if (!data) {
        const { data: newUsage, error: insertError } = await supabase
          .from("chat_usage")
          .upsert(
            {
              user_id: user.id,
              chat_count: 0,
              chat_limit: 10,
              is_premium: false,
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();

        if (insertError) throw insertError;
        setChatUsage(newUsage);
      } else {
        setChatUsage(data);
      }
    } catch (error: any) {
      console.error("Error fetching chat usage:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        const welcomeMessage = {
          id: "welcome",
          content:
            "Hello! I'm your wellness companion. I'm here to listen and support you on your mental health journey. How are you feeling today?",
          sender: "ai" as const,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicSelect = async (topic: string) => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      await sendTopicWebhook(topic, user.id);

      setSelectedTopic(topic as Topic);
      
      toast({
        title: "Topic Selected",
        description: `You're now chatting about ${topic}`,
      });
    } catch (error: any) {
      console.error("Error selecting topic:", error);
      toast({
        title: "Warning",
        description: "Topic selected, but notification failed. You can still chat.",
        variant: "default",
      });
      setSelectedTopic(topic as Topic);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  const handleSendMessage = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      if (chatUsage && !chatUsage.is_premium && chatUsage.chat_count >= chatUsage.chat_limit) {
        toast({
          title: "Chat Limit Reached",
          description: `You've reached your daily limit of ${chatUsage.chat_limit} messages. Upgrade to premium for unlimited chats!`,
          variant: "destructive",
        });
        return;
      }

      const userMessage = inputValue;

      const { error: userError } = await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          content: userMessage,
          sender: "user",
        },
      ]);

      if (userError) throw userError;

      setInputValue("");
      setIsTyping(true);

      try {
        const { data, error: functionError } = await supabase.functions.invoke(
          'supabase-functions-n8n-webhook-proxy',
          {
            body: {
              message: userMessage,
              user_id: user.id,
              topic: selectedTopic?.id,
              timestamp: new Date().toISOString(),
            },
          }
        );

        if (functionError) {
          throw functionError;
        }

        let aiResponse = data?.message || data?.output || data?.response || data?.advice;

        if (!aiResponse) {
          aiResponse = "Thank you for sharing. I'm here to support you on your mental health journey.";
        }

        const { error: aiError } = await supabase.from("chat_messages").insert([
          {
            user_id: user.id,
            content: aiResponse,
            sender: "ai",
          },
        ]);

        if (aiError) throw aiError;

        const { error: updateError } = await supabase.rpc('increment_chat_count', {
          p_user_id: user.id
        });

        if (updateError) {
          const { data: currentUsage } = await supabase
            .from("chat_usage")
            .select("chat_count")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          await supabase
            .from("chat_usage")
            .update({
              chat_count: (currentUsage?.chat_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        await fetchChatUsage();

      } catch (webhookError: any) {
        const fallbackResponse =
          "I'm here to listen and support you. Could you tell me more about what's on your mind?";

        const { error: aiError } = await supabase.from("chat_messages").insert([
          {
            user_id: user.id,
            content: fallbackResponse,
            sender: "ai",
          },
        ]);

        if (aiError) throw aiError;

        const { error: updateError } = await supabase.rpc('increment_chat_count', {
          p_user_id: user.id
        });

        if (updateError) {
          const { data: currentUsage } = await supabase
            .from("chat_usage")
            .select("chat_count")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          await supabase
            .from("chat_usage")
            .update({
              chat_count: (currentUsage?.chat_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        await fetchChatUsage();

        toast({
          title: "Server Error",
          description: "Server sedang sibuk, coba lagi.",
          variant: "destructive",
        });
      }

      setIsTyping(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return <TopicSelector onSelectTopic={handleTopicSelect} />;
  }

  const isLimitReached = chatUsage && !chatUsage.is_premium && chatUsage.chat_count >= chatUsage.chat_limit;
  const remainingChats = chatUsage ? Math.max(0, chatUsage.chat_limit - chatUsage.chat_count) : 0;

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Wellness Companion
                  <Badge variant="secondary" className="text-xs">
                    Topic: {selectedTopic.title}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  A safe space to share your thoughts and feelings
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToTopics}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Topic
            </Button>
          </div>
          
          {chatUsage && !chatUsage.is_premium && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Messages remaining: {remainingChats} / {chatUsage.chat_limit}
                </span>
                {isLimitReached && (
                  <span className="text-destructive font-semibold">Limit reached</span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isLimitReached ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{
                    width: `${(chatUsage.chat_count / chatUsage.chat_limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {isLimitReached && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chat Limit Reached</AlertTitle>
          <AlertDescription>
            You've used all {chatUsage?.chat_limit} free messages today. Upgrade to premium for unlimited AI conversations!
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea ref={scrollAreaRef} className="h-[500px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={
                        message.sender === "ai" ? "bg-primary/10" : "bg-muted"
                      }
                    >
                      {message.sender === "ai" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex-1 max-w-[80%] ${message.sender === "user" ? "text-right" : ""}`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLimitReached ? "Upgrade to continue chatting..." : "Share what's on your mind..."}
              className="flex-1"
              disabled={isTyping || isLimitReached}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || isLimitReached}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isLimitReached 
              ? "Upgrade to premium for unlimited conversations"
              : "This is a supportive space. Feel free to share your thoughts and feelings."
            }
          </p>
        </div>
      </Card>
    </div>
  );
}