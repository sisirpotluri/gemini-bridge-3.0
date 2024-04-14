import React, { useState } from 'react';
import { TextField, Grid, Button } from '@mui/material';
import './Answer.css';


const Answer = ({ onSubmitAnswer, setOnSubmitAnswer, currentQuestion, setCurrentQuestion }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [placeholder, setPlaceHolder] = useState('');

  // const handleChange = (e) => setUserAnswer(e.target.value);


  const handleInputChange = (event) => {
    setUserAnswer(event.target.value);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Recieved answer:", e)
  //   setOnSubmitAnswer(userAnswer);
  //   setPlaceHolder('')
  //   setUserAnswer(''); // Clear the input after submitting
  //   // use Flask APIs to get update from Gemini
  //   // use setCurrentQuestion to set the next question based on Gemini-response
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Received answer:", userAnswer);

    // Create a JSON object with the answer
    const requestData = {
        answer: userAnswer,
        question: currentQuestion
    };

    try {
        const response = await fetch('http://localhost:5111/get_next_question/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData) // Send the JSON payload
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log("Response from server:", responseData);
    
        // Assuming responseData contains the text data you want to set as the current question
        setCurrentQuestion(responseData.data);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        // Handle errors here
    }

    // Additional logic if needed
    setPlaceHolder('');
    setUserAnswer(''); // Clear the input after submitting
    // use Flask APIs to get update from Gemini
    // use setCurrentQuestion to set the next question based on Gemini-response
  };

  return (
    <div className="question-container" elevation={0} style={{ borderRadius: 10, backgroundColor: '#282828', marginTop:"-2.5em" }}>
      <Grid container spacing={2} alignItems="center" style={{ backgroundColor: '#282828' }}>
      <Grid item xs={9}>
        <TextField 
          InputProps={{
            style: { color: 'white', marginBottom: "1em"},
            classes: {
              underline: 'white-underline'
            }
          }}
          InputLabelProps={{
            style: { color: 'white' }
          }}
          label="Your Answer"
          variant="standard"
          fullWidth
          value={userAnswer}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Submit
        </Button>
      </Grid>
    </Grid>
    </div>
    
    // <div>
    //   <TextField
    //     label="Your Answer"
    //     variant="outlined"
    //     fullWidth
    //     value={userAnswer}
    //     onChange={handleInputChange}
    //     placeholder="Type your answer here"
    //   />
    //   <Button
    //     variant="contained"
    //     color="primary"
    //     onClick={handleSubmit}
    //     style={{ marginTop: '1rem' }}
    //   >
    //     Submit
    //   </Button>
    // </div>
  );
};

export default Answer;