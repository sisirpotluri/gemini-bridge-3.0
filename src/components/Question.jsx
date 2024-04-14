import React from 'react';
import Typography from '@mui/joy/Typography';
import { TextField, Grid, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import './Question.css';


const Question = ({ response }) => {
  return (
    <>
    <div className="question-container" style={{ backgroundColor: '#282828' }}>
      {/* <Typography variant="h2" color='white' fontWeight='bold'>
          {response.type}
       </Typography>
      <Typography variant="h4" color='white'>
          {response.content}
       </Typography> */}

       <Typography variant="h4" color='white'>
          <ReactMarkdown>{response}</ReactMarkdown>
       </Typography>

    </div>
    </>
  );
};

export default Question;