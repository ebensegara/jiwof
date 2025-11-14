"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Search, UserCheck, UserX, Link as LinkIcon, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface Professional {
  id: string;
  full_name: string;
  specialization: string;
  category: string;
  bio: string;
  experience_years: number;
  rating: number;
  price_per_session: number;
  is_available: boolean;
  avatar_url: string;
  user_id: string | null;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  const [formData, setFormData] = useState({
    user_id: "",
    specialization: "",
    category: "Psychologist",
    bio: "",
    experience_years: 0,
    price_per_session: 0,
    is_available: true,
    avatar_url: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        router.replace("/dashboard");
        return;
      }

      loadProfessionals();
      loadUsers();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.replace("/dashboard");
    }
  };

  const loadProfessionals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast({
        title: "Error",
        description: "Failed to load professionals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProfessional) {
        // Update existing professional
        const { error } = await supabase
          .from("professionals")
          .update({
            user_id: formData.user_id || null,
            specialization: formData.specialization,
            category: formData.category,
            bio: formData.bio,
            experience_years: formData.experience_years,
            price_per_session: formData.price_per_session,
            is_available: formData.is_available,
            avatar_url: formData.avatar_url,
          })
          .eq("id", editingProfessional.id);

        if (error) throw error;

        // Update user role to 'professional' if user_id is set
        if (formData.user_id) {
          await supabase
            .from("users")
            .update({ role: "professional" })
            .eq("id", formData.user_id);
        }

        toast({
          title: "Success",
          description: "Professional updated successfully",
        });
      } else {
        // Create new professional
        if (!formData.user_id) {
          toast({
            title: "Error",
            description: "Please select a user to assign as professional",
            variant: "destructive",
          });
          return;
        }

        // Get user's full name
        const selectedUser = users.find(u => u.id === formData.user_id);
        
        const { error } = await supabase
          .from("professionals")
          .insert([{
            user_id: formData.user_id,
            full_name: selectedUser?.full_name || "",
            specialization: formData.specialization,
            category: formData.category,
            bio: formData.bio,
            experience_years: formData.experience_years,
            price_per_session: formData.price_per_session,
            is_available: formData.is_available,
            avatar_url: formData.avatar_url,
            rating: 5.0,
          }]);

        if (error) throw error;

        // Update user role to 'professional'
        await supabase
          .from("users")
          .update({ role: "professional" })
          .eq("id", formData.user_id);

        toast({
          title: "Success",
          description: "Professional added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadProfessionals();
      loadUsers();
    } catch (error) {
      console.error("Error saving professional:", error);
      toast({
        title: "Error",
        description: "Failed to save professional",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this professional?")) return;

    try {
      const professional = professionals.find(p => p.id === id);
      
      const { error } = await supabase
        .from("professionals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Optionally reset user role back to 'user'
      if (professional?.user_id) {
        await supabase
          .from("users")
          .update({ role: "user" })
          .eq("id", professional.user_id);
      }

      toast({
        title: "Success",
        description: "Professional deleted successfully",
      });
      loadProfessionals();
      loadUsers();
    } catch (error) {
      console.error("Error deleting professional:", error);
      toast({
        title: "Error",
        description: "Failed to delete professional",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      user_id: professional.user_id || "",
      specialization: professional.specialization,
      category: professional.category,
      bio: professional.bio,
      experience_years: professional.experience_years,
      price_per_session: professional.price_per_session,
      is_available: professional.is_available,
      avatar_url: professional.avatar_url,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProfessional(null);
    setFormData({
      user_id: "",
      specialization: "",
      category: "Psychologist",
      bio: "",
      experience_years: 0,
      price_per_session: 0,
      is_available: true,
      avatar_url: "",
    });
  };

  const filteredProfessionals = professionals.filter(prof =>
    prof.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get users that are not already professionals
  const availableUsers = users.filter(user => 
    !professionals.some(prof => prof.user_id === user.id)
  );

  // Get user info for a professional
  const getUserInfo = (userId: string | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.replace("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage professionals and system settings
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {professionals.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Linked to Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {professionals.filter(p => p.user_id).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {professionals.filter(p => p.is_available).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {professionals.filter(p => !p.is_available).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#8B6CFD] hover:bg-[#7A5CE8]">
                <Plus className="h-4 w-4 mr-2" />
                Assign Professional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProfessional ? "Edit Professional" : "Assign User as Professional"}
                </DialogTitle>
                <DialogDescription>
                  {editingProfessional 
                    ? "Update professional details and linked user account" 
                    : "Select an existing user and assign them as a professional"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="user_id">Select User *</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {editingProfessional && editingProfessional.user_id && (
                        <SelectItem value={editingProfessional.user_id}>
                          {getUserInfo(editingProfessional.user_id)?.email} (Current)
                        </SelectItem>
                      )}
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} - {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    User must signup first before being assigned as professional
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Psychologist">Psychologist</SelectItem>
                        <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                        <SelectItem value="Counselor">Counselor</SelectItem>
                        <SelectItem value="Therapist">Therapist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience_years">Experience (years)</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_per_session">Price per Session (IDR) *</Label>
                    <Input
                      id="price_per_session"
                      type="number"
                      value={formData.price_per_session}
                      onChange={(e) => setFormData({ ...formData, price_per_session: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="is_available">Available for booking</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-[#8B6CFD] hover:bg-[#7A5CE8]">
                    {editingProfessional ? "Update" : "Assign"} Professional
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Professionals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => {
            const userInfo = getUserInfo(professional.user_id);
            return (
              <Card key={professional.id} className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[#8B6CFD]/10 flex items-center justify-center">
                        {professional.avatar_url ? (
                          <img
                            src={professional.avatar_url}
                            alt={professional.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[#8B6CFD] font-semibold">
                            {professional.full_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{professional.full_name}</CardTitle>
                        <CardDescription>{professional.category}</CardDescription>
                      </div>
                    </div>
                    {professional.is_available ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserX className="h-3 w-3 mr-1" />
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    {userInfo ? (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <LinkIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600 dark:text-blue-400 text-xs">
                          Linked: {userInfo.email}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                          ⚠️ No user account linked
                        </span>
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Specialization:</strong> {professional.specialization}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Experience:</strong> {professional.experience_years} years
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Price:</strong> IDR {professional.price_per_session.toLocaleString()}/session
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Rating:</strong> ⭐ {professional.rating.toFixed(1)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(professional)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(professional.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProfessionals.length === 0 && (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? "No professionals found matching your search" : "No professionals assigned yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}