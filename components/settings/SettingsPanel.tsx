'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2, UserPlus } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type Role = 'owner' | 'admin' | 'staff' | 'viewer';

interface Member {
  userId: string;
  email: string;
  role: Role;
  joinedAt: string;
}

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  staff: 'Staff',
  viewer: 'Viewer (read-only)',
};

const ROLE_BADGE_VARIANT: Record<Role, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  staff: 'outline',
  viewer: 'outline',
};

export function SettingsPanel({ companyId, onShopUpdated }: { companyId: number; onShopUpdated: () => void }) {
  const { user } = useAuthContext();

  // Shop profile
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [loadingShop, setLoadingShop] = useState(true);
  const [savingShop, setSavingShop] = useState(false);
  const [shopMessage, setShopMessage] = useState('');

  const fetchShop = async () => {
    setLoadingShop(true);
    const { data } = await supabase.schema('saree').from('companies').select('name, accounting_year').eq('id', companyId).single();
    if (data) {
      setName(data.name);
      setYear(data.accounting_year || '');
    }
    setLoadingShop(false);
  };

  useEffect(() => {
    fetchShop();
  }, [companyId]);

  // Team
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [teamError, setTeamError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('staff');
  const [inviting, setInviting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    setTeamError('');
    try {
      const res = await fetch('/api/settings/team');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load team');
      setMembers(body.members);
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Failed to load team');
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [companyId]);

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    setShopMessage('');
    try {
      const res = await fetch('/api/settings/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, accounting_year: year }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to save');
      setShopMessage('Shop details saved');
      onShopUpdated();
    } catch (error) {
      setShopMessage(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSavingShop(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setTeamError('');
    try {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to invite');
      setInviteEmail('');
      setInviteRole('staff');
      await fetchMembers();
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    setBusyUserId(userId);
    setTeamError('');
    try {
      const res = await fetch('/api/settings/team/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to update role');
      await fetchMembers();
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from this shop?`)) return;
    setBusyUserId(userId);
    setTeamError('');
    try {
      const res = await fetch('/api/settings/team/member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to remove');
      await fetchMembers();
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'Failed to remove');
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Profile</CardTitle>
          <CardDescription>Name and accounting year shown across the app</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingShop ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : (
          <form onSubmit={handleSaveShop} className="space-y-4">
            {shopMessage && (
              <Alert className={shopMessage.includes('saved') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <AlertDescription className={shopMessage.includes('saved') ? 'text-green-800' : 'text-red-800'}>
                  {shopMessage}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input id="shop_name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="shop_year">Accounting Year</Label>
                <Input
                  id="shop_year"
                  placeholder="e.g. 2026-2027"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={savingShop}>
              {savingShop ? 'Saving...' : 'Save Shop Details'}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Invite people to this shop and control what they can do</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {teamError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-800">{teamError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="teammate@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as Role)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviting}>
              <UserPlus className="w-4 h-4 mr-2" />
              {inviting ? 'Inviting...' : 'Invite'}
            </Button>
          </form>

          {loadingMembers ? (
            <p className="text-slate-500 text-sm">Loading team...</p>
          ) : members.length === 0 ? (
            <p className="text-slate-500 text-sm">No team members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-2 font-medium text-slate-600">Email</th>
                    <th className="text-left p-2 font-medium text-slate-600">Role</th>
                    <th className="text-right p-2 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.userId} className="border-b border-slate-100">
                      <td className="p-2">
                        {member.email}
                        {member.userId === user?.id && <span className="text-slate-400"> (You)</span>}
                      </td>
                      <td className="p-2">
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.userId, value as Role)}
                          disabled={busyUserId === member.userId}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue>
                              <Badge variant={ROLE_BADGE_VARIANT[member.role]}>{ROLE_LABELS[member.role]}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyUserId === member.userId}
                          onClick={() => handleRemove(member.userId, member.email)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
