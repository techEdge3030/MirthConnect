import { useEffect, useState } from 'react';
import MainPageLayout from '../layouts/MainPageLayout';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

const ClientAPIPage = () => {
  const [content, setContent] = useState<string>('');
  const [isJson, setIsJson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenAPI = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/openapi.json');
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setContent(JSON.stringify(data, null, 2));
          setIsJson(true);
        } catch (jsonErr) {
          setContent(text);
          setIsJson(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load OpenAPI spec');
      } finally {
        setLoading(false);
      }
    };
    fetchOpenAPI();
  }, []);

  return (
    <MainPageLayout title="View Client API" currentSection="client api">
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Mirth Server OpenAPI (client)
        </Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && (
          <Paper sx={{ p: 2, mt: 2, background: '#222', color: '#fff', fontFamily: 'monospace', fontSize: 14, overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content}</pre>
          </Paper>
        )}
      </Box>
    </MainPageLayout>
  );
};

export default ClientAPIPage; 