import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/users');
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (id, newRole) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-black text-primary font-outfit uppercase">
          System Administration
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Manage system access and roles
        </p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
        <h2 className="text-base font-bold text-gray-900 font-outfit uppercase mb-4 tracking-wide flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> User Management
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-700">
              <thead className="text-[10px] uppercase bg-gray-150 border-b text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {users.map(u => (
                  <tr key={u._id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-[10px] uppercase font-bold cursor-pointer"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="industry">Industry</option>
                        <option value="government_officer">Government</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{u.department || '--'}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-alert-red font-bold uppercase tracking-wider text-[10px] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
