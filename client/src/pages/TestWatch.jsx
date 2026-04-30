import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import mediaApi from "../api/modules/media.api";
import watchSourceApi from "../api/modules/watchSource.api";

const TestWatch = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  
  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    const runTests = async () => {
      addResult("🧪 Starting watch functionality tests...", 'info');
      
      const movieId = 1291595; // Insidious: Out of the Further
      const mediaType = 'movie';
      
      try {
        // Test 1: Media API
        addResult("1️⃣ Testing media API...", 'info');
        const { response: mediaResponse, err: mediaErr } = await mediaApi.getDetail({ mediaType, mediaId: movieId });
        
        if (mediaErr) {
          addResult(`❌ Media API Error: ${mediaErr.message}`, 'error');
        } else {
          addResult(`✅ Media API Success: ${mediaResponse.title}`, 'success');
        }
        
        // Test 2: Watch Sources API
        addResult("2️⃣ Testing watch sources API...", 'info');
        const { response: sourceResponse, err: sourceErr } = await watchSourceApi.getByMedia({ mediaType, mediaId: movieId });
        
        if (sourceErr) {
          addResult(`❌ Sources API Error: ${sourceErr.message}`, 'error');
        } else {
          const embedCount = sourceResponse?.embedSources?.length || 0;
          const dbCount = sourceResponse?.dbSources?.length || 0;
          const torrentCount = sourceResponse?.torrentSources?.length || 0;
          
          addResult(`✅ Sources API Success: ${embedCount} embed, ${dbCount} db, ${torrentCount} torrent`, 'success');
          
          if (embedCount === 0 && dbCount === 0 && torrentCount === 0) {
            addResult("⚠️ No sources available - this explains 'media unavailable'", 'warning');
          }
        }
        
        addResult("🎯 Tests completed!", 'info');
        
      } catch (error) {
        addResult(`💥 Unexpected error: ${error.message}`, 'error');
      }
    };
    
    runTests();
  }, []);

  const getColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'orange';
      default: return 'inherit';
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 Watch Functionality Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/movie/1291595/watch')}
          sx={{ mr: 2 }}
        >
          Go to Watch Page
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/movie/1291595')}
        >
          Go to Movie Detail
        </Button>
      </Box>
      
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 2, 
        borderRadius: 1, 
        border: '1px solid',
        borderColor: 'divider',
        maxHeight: 400,
        overflow: 'auto'
      }}>
        {testResults.map((result, index) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ 
              color: getColor(result.type),
              fontFamily: 'monospace',
              mb: 0.5
            }}
          >
            [{result.time}] {result.message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default TestWatch;