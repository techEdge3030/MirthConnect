import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import type { ChangeEvent, FormEvent } from 'react';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import MirthLogo from '../../assets/MirthConectLogo.png';
import SagaOIELogo from '../../assets/logo.svg';
import { useAlert } from '../../providers';
import AuthContext from '../../providers/AuthProvider';
import { login, getMirthVersion } from '../../services';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [version, setVersion] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { setOpen, setSeverity, setMessage } = useAlert();
  const { setLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const versionInfo = await getMirthVersion();
        setVersion(versionInfo.version);
        setTitle(versionInfo.title);
        setDescription(versionInfo.description);
      } catch (error) {
        console.error('Failed to fetch version:', error);
        // Don't show error to user for version fetch failure
      }
    };

    fetchVersion();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(username, password);
      setLoggedIn(true);
      navigate('/dashboard');
    } catch (e) {
      setSeverity('error');
      setMessage((e as Error).message);
      setOpen(true);
    }
  };

  const changeUsername = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setUsername(event.target.value);
  const changePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setPassword(event.target.value);

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Grid item>
        <Box
          component="form"
          sx={{ backgroundColor: 'white', padding: '10px' }}
          onSubmit={handleSubmit}
        >
          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
                              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                  <img src={SagaOIELogo} />
                  {(title || version) && (
                    <Box display="flex" alignItems="center" gap={1}>
                      {title && (
                        <Typography variant="caption" color="text.secondary">
                          {title}
                        </Typography>
                      )}
                      {version && (
                        <Typography variant="caption" color="text.secondary">
                          v{version}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
            </Grid>
            <Grid item width="100%">
              <TextField
                label="Username"
                name="username"
                fullWidth
                onChange={changeUsername}
              />
            </Grid>
            <Grid item width="100%">
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                onChange={changePassword}
              />
            </Grid>
            <Grid item>
              <Button color="primary" variant="contained" type="submit">
                Login
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
