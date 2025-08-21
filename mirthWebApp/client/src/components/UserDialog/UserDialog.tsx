import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Alert
} from '@mui/material';
import MirthSelect from '../MirthSelect';
import { COUNTRY_OPTIONS, STATE_TERRITORY_OPTIONS, ROLE_OPTIONS, INDUSTRY_OPTIONS } from '../../constants/userFormOptions';

interface User {
  id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  stateTerritory?: string;
  role?: string;
  industry?: string;
  description?: string;
}

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: User, password?: string) => Promise<boolean>;
  user?: User | null;
  isNewUser?: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSave,
  user,
  isNewUser = false
}) => {
  const [formData, setFormData] = useState<User>({
    username: '',
    firstName: '',
    lastName: '',
    organization: '',
    email: '',
    phoneNumber: '',
    country: '',
    stateTerritory: '',
    role: '',
    industry: '',
    description: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          id: user.id,
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          organization: user.organization || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          country: user.country || '',
          stateTerritory: user.stateTerritory || '',
          role: user.role || '',
          industry: user.industry || '',
          description: user.description || ''
        });
      } else {
        setFormData({
          username: '',
          firstName: '',
          lastName: '',
          organization: '',
          email: '',
          phoneNumber: '',
          country: '',
          stateTerritory: '',
          role: '',
          industry: '',
          description: ''
        });
      }
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setSaveError('');
    }
  }, [open, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (isNewUser && !password) {
      newErrors.password = 'Password is required for new users';
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.organization?.trim()) {
      newErrors.organization = 'Organization is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSaveError('');

    try {
      // For new user, always pass password. For edit, only pass password if filled.
      const success = await onSave(formData, password ? password : undefined);
      if (success) {
        onClose();
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isNewUser ? 'New User' : 'Edit User'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username *"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                disabled={!isNewUser} // Username cannot be changed for existing users
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization *"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                error={!!errors.organization}
                helperText={errors.organization}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </Grid>
            {/* Password fields always shown for both create and edit */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isNewUser ? 'Password *' : 'Password'}
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={!!errors.password}
                helperText={errors.password || (!isNewUser ? 'Leave blank to keep current password' : '')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isNewUser ? 'Confirm Password *' : 'Confirm Password'}
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.country}>
                <InputLabel>Country *</InputLabel>
                <Select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  label="Country *"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State/Territory</InputLabel>
                <Select
                  value={formData.stateTerritory}
                  onChange={(e) => handleInputChange('stateTerritory', e.target.value)}
                  label="State/Territory"
                >
                  {STATE_TERRITORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Role"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  label="Industry"
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog; 