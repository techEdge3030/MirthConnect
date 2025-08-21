import React from 'react';
import {
  Box,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';
import { ARCHIVE_CONTENT_OPTIONS, COMPRESSION_OPTIONS, ENCRYPTION_OPTIONS } from '../constants';

interface ArchiveSettings {
  enableArchiving: boolean;
  archiveBlockSize: string;
  content: string;
  encrypt: boolean;
  includeAttachments: boolean;
  compression: string;
  passwordProtect: boolean;
  encryptionType: string;
  password: string;
  rootPath: string;
  filePattern: string;
}

interface ArchiveValidationErrors {
  archiveBlockSize: string;
  rootPath: string;
  filePattern: string;
  password: string;
}

interface ArchiveSectionProps {
  archiveSettings: ArchiveSettings;
  archiveValidationErrors: ArchiveValidationErrors;
  focusedField: string | null;
  onArchiveChange: (field: keyof ArchiveSettings, value: any) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
  onTokenInsert: (fieldId: string, tokenValue: string) => void;
  isPasswordProtectDisabled: () => boolean;
  isEncryptionTypeDisabled: () => boolean;
  isPasswordFieldDisabled: () => boolean;
  SectionTitle: React.ComponentType<{ children: React.ReactNode }>;
  FieldLabel: React.ComponentType<{ children: React.ReactNode; disabled?: boolean }>;
  ClickableTextField: React.ComponentType<any>;
  TokensPanel: React.ComponentType<{
    focusedField: string | null;
    onTokenClick: (tokenValue: string) => void;
  }>;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  archiveSettings,
  archiveValidationErrors,
  focusedField,
  onArchiveChange,
  onFieldFocus,
  onFieldBlur,
  onTokenInsert,
  isPasswordProtectDisabled,
  isEncryptionTypeDisabled,
  isPasswordFieldDisabled,
  SectionTitle,
  FieldLabel,
  ClickableTextField,
  TokensPanel
}) => {
  return (
    <>
      <SectionTitle>Archive Settings</SectionTitle>

      <Grid container spacing={3}>
        {/* Archive Settings Form */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <FieldLabel>Enable Archiving:</FieldLabel>
              </Grid>
              <Grid item>
                <RadioGroup
                  row
                  value={archiveSettings.enableArchiving ? 'Yes' : 'No'}
                  onChange={(e) => onArchiveChange('enableArchiving', e.target.value === 'Yes')}
                >
                  <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <FieldLabel disabled={!archiveSettings.enableArchiving}>Archive Block Size:</FieldLabel>
              </Grid>
              <Grid item>
                <ClickableTextField
                  size="small"
                  type="number"
                  value={archiveSettings.archiveBlockSize}
                  onChange={(e: any) => onArchiveChange('archiveBlockSize', e.target.value)}
                  disabled={!archiveSettings.enableArchiving}
                  fieldId="archiveBlockSize"
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  error={!!archiveValidationErrors.archiveBlockSize}
                  helperText={archiveValidationErrors.archiveBlockSize}
                  sx={{ width: '100px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <FieldLabel disabled={!archiveSettings.enableArchiving}>Content:</FieldLabel>
              </Grid>
              <Grid item>
                <FormControl size="small" disabled={!archiveSettings.enableArchiving}>
                  <Select
                    value={archiveSettings.content}
                    onChange={(e) => onArchiveChange('content', e.target.value)}
                    sx={{ minWidth: '200px' }}
                  >
                    {ARCHIVE_CONTENT_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={archiveSettings.encrypt}
                      onChange={(e) => onArchiveChange('encrypt', e.target.checked)}
                      disabled={!archiveSettings.enableArchiving}
                      size="small"
                    />
                  }
                  label="Encrypt"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={archiveSettings.includeAttachments}
                      onChange={(e) => onArchiveChange('includeAttachments', e.target.checked)}
                      disabled={!archiveSettings.enableArchiving || archiveSettings.content !== 'XML serialized message'}
                      size="small"
                    />
                  }
                  label="Include Attachments"
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <FieldLabel disabled={!archiveSettings.enableArchiving}>Compression:</FieldLabel>
              </Grid>
              <Grid item>
                <FormControl size="small" disabled={!archiveSettings.enableArchiving}>
                  <Select
                    value={archiveSettings.compression}
                    onChange={(e) => onArchiveChange('compression', e.target.value)}
                    sx={{ minWidth: '120px' }}
                  >
                    {COMPRESSION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Password Protect - only show for zip compression */}
            {archiveSettings.compression === 'zip' && (
              <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <FieldLabel disabled={isPasswordProtectDisabled()}>Password Protect:</FieldLabel>
                </Grid>
                <Grid item>
                  <RadioGroup
                    row
                    value={archiveSettings.passwordProtect ? 'Yes' : 'No'}
                    onChange={(e) => onArchiveChange('passwordProtect', e.target.value === 'Yes')}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio size="small" disabled={isPasswordProtectDisabled()} />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio size="small" disabled={isPasswordProtectDisabled()} />}
                      label="No"
                    />
                  </RadioGroup>
                </Grid>
                <Grid item>
                  <FormControl size="small" disabled={isEncryptionTypeDisabled()}>
                    <Select
                      value={archiveSettings.encryptionType}
                      onChange={(e) => onArchiveChange('encryptionType', e.target.value)}
                      sx={{ minWidth: '100px' }}
                    >
                      {ENCRYPTION_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Password field - only show for zip compression and when password protect is enabled */}
            {archiveSettings.compression === 'zip' && archiveSettings.passwordProtect && (
              <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <FieldLabel disabled={isPasswordFieldDisabled()}>Password:</FieldLabel>
                </Grid>
                <Grid item xs={6}>
                  <ClickableTextField
                    size="small"
                    type="password"
                    value={archiveSettings.password}
                    onChange={(e: any) => onArchiveChange('password', e.target.value)}
                    disabled={isPasswordFieldDisabled()}
                    fieldId="password"
                    onFocus={onFieldFocus}
                    onBlur={onFieldBlur}
                    error={!!archiveValidationErrors.password}
                    helperText={archiveValidationErrors.password}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            <Grid container alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <FieldLabel disabled={!archiveSettings.enableArchiving}>Root Path:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClickableTextField
                    size="small"
                    value={archiveSettings.rootPath}
                    onChange={(e: any) => onArchiveChange('rootPath', e.target.value)}
                    disabled={!archiveSettings.enableArchiving}
                    fieldId="rootPath"
                    onFocus={onFieldFocus}
                    onBlur={onFieldBlur}
                    error={!!archiveValidationErrors.rootPath}
                    helperText={archiveValidationErrors.rootPath}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: !archiveSettings.enableArchiving ? 'text.disabled' : 'text.secondary',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    /[timestamp]/[channel id].zip
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item>
                <FieldLabel disabled={!archiveSettings.enableArchiving}>File Pattern:</FieldLabel>
              </Grid>
              <Grid item xs>
                <ClickableTextField
                  multiline
                  rows={8}
                  value={archiveSettings.filePattern}
                  onChange={(e: any) => onArchiveChange('filePattern', e.target.value)}
                  disabled={!archiveSettings.enableArchiving}
                  fieldId="filePattern"
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  error={!!archiveValidationErrors.filePattern}
                  helperText={archiveValidationErrors.filePattern}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Available Fields Panel */}
        <Grid item xs={12} md={4}>
          <TokensPanel
            focusedField={focusedField}
            onTokenClick={(tokenValue) => onTokenInsert(focusedField!, tokenValue)}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ArchiveSection;
