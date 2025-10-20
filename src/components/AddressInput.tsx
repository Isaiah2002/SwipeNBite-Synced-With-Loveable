import { useState, useEffect } from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const addressSchema = z.object({
  address: z.string().trim().min(1, "Address is required").max(200, "Address too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City too long"),
  state: z.string().trim().min(2, "State is required").max(50, "State too long"),
  zip_code: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
});

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export const AddressInput = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressData | null>(null);
  const [formData, setFormData] = useState<AddressData>({
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  useEffect(() => {
    fetchCurrentAddress();
  }, []);

  const fetchCurrentAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('address, city, state, zip_code')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data && data.address) {
        const addressData: AddressData = {
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || ''
        };
        setCurrentAddress(addressData);
        setFormData(addressData);
      }
    } catch (error: any) {
      console.error('Error fetching address:', error);
    }
  };

  const validateForm = (): boolean => {
    try {
      addressSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof AddressData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof AddressData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentAddress(formData);
      setOpen(false);
      toast.success('Delivery address saved!');
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentAddress) {
      setFormData(currentAddress);
    } else {
      setFormData({ address: '', city: '', state: '', zip_code: '' });
    }
    setErrors({});
    setOpen(false);
  };

  const displayAddress = currentAddress 
    ? `${currentAddress.address}, ${currentAddress.city}, ${currentAddress.state} ${currentAddress.zip_code}`
    : 'No delivery address set';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start text-left text-sm"
        >
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            {currentAddress ? displayAddress : 'Set delivery address'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delivery Address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, Apt 4B"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Washington"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="DC"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={errors.state ? 'border-destructive' : ''}
              />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                placeholder="20001"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className={errors.zip_code ? 'border-destructive' : ''}
              />
              {errors.zip_code && (
                <p className="text-sm text-destructive">{errors.zip_code}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Address
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
