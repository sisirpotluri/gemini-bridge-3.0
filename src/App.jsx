
import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Chat from './components/Chat';
import Question from './components/Question';
import Answer from './components/Answer';
import Grid from '@mui/material/Grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Card from '@mui/material/Card';
import axios from 'axios';
import './App.css';

// Import JSON into a JavaScript object
// import structure from './course/EECS280/structure.json';
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [onSubmitAnswer, setOnSubmitAnswer] = useState("");
  const [currentVideo, setCurrentVideo] = useState("./videos/bst.mp4");
  const [messages, setMessages] = useState([]);
  const [mainModel, setMainModel] = useState(null);
  const [structure, setStructure] = useState(null);

  // // Fetch video data on component mount (replace with your API call)
  
  useEffect(() => {
    axios.get('http://localhost:5111/structure/', { credentials: "same-origin" })
      .then(response => {
        setStructure(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // useEffect(() => {
  //   // Declare a boolean flag that we can use to cancel the API request.
  //   let ignoreStaleRequest = false;

  //   // Call REST API to get the post's information
  //   fetch('http://localhost:5001/structure/', { credentials: "same-origin" })
  //     .then((response) => {
  //       if (!response.ok) throw Error(response.statusText);
  //       return response.text();
  //     })
  //     .then((data) => {
  //       // If ignoreStaleRequest was set to true, we want to ignore the results of the
  //       // the request. Otherwise, update the state to trigger a new render.
  //       if (!ignoreStaleRequest) {
  //         // read response stream as text
  //         setStructure(data);
  //       }
  //     })
  //     .catch((error) => console.log(error));

  //   return () => {
  //     // This is a cleanup function that runs whenever the Post component
  //     // unmounts or re-renders. If a Post is about to unmount or re-render, we
  //     // should avoid updating state.
  //     ignoreStaleRequest = true;
  //   };
  // }, []);

  // // Function to handle new chat messages
  const handleNewMessage = (message) => {
    // Send message to backend API (replace with your API call)
    fetch('https://your-backend-api.com/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
      .then(() => {
        setMessages([...messages, message]);
      })
      .catch(error => console.error('Error sending message:', error));
  };

  if (structure === null) {
    return(
    <header style={{  marginTop:'-5em', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ justifyContent: 'center', width: '100%' }}>
        <img src="../src/logolow.png" alt="Logo" className="logo" />  
            <div>Gearing up for some Magic...</div>
        </div>
        </header>
    )
  }

  // current chapter
  const chapter = 21;
  const curr_module = 1;
  const curr_question_idx = 1;
  const chapter_dict = structure.chapters[chapter];

  if (currentQuestion === null) {
    setCurrentQuestion( "What is the maximum number of children nodes for each node in a binary search tree?")
  }

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <div className="app-container">

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2em' }}>
          <div style={{ maxWidth:"100%", marginTop: "-0.5em", marginBottom: "1.5em", display: 'flex', alignItems: 'center'}}>
            <img src="../src/logolow.png" alt="Logo" className="logo" />          
          </div>
        </div>
          
        </header>
      {/* <ThemeProvider theme={darkTheme}>
        <CssBaseline /> */}
        <main>
          <Grid container spacing={8} style={{ paddingTop:"1em"}} >
            <Grid item xs={8}>
              <section className="video-section">
                {currentVideo && <VideoPlayer videoSrc={currentVideo} chapter_dict={chapter_dict} structure={structure} curr_module={curr_module}/>}
              </section>
              <section className="question-answer-section">
                <Question response={currentQuestion} />
                <Answer currentQuestion={currentQuestion} onSubmitAnswer={onSubmitAnswer} setOnSubmitAnswer={setOnSubmitAnswer} setCurrentQuestion={setCurrentQuestion}/>
              </section>
            </Grid>
            <Grid item xs={4}>
              <section className="chat-section">
                <Chat messages={messages} onNewMessage={handleNewMessage} />
              </section>
            </Grid>
          </Grid>
        </main>
      {/* </ThemeProvider> */}
    </div>
  );
}

export default App;