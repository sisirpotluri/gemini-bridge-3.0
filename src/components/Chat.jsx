import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, Typography, InputAdornment } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ReactMarkdown from 'react-markdown';
import { GoogleGenerativeAI } from "@google/generative-ai"

const INITIAL_PROMPT = "Ask me anything about the video. I can clarify concepts, provide background information, and guide you to specific timestamps."

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState(null);

  // Set up Google API
  useEffect(() => {
      const API_KEY = '';
      const generativeAI = new GoogleGenerativeAI(API_KEY);
      const initModel = async () => {
        const loadedModel = await generativeAI.getGenerativeModel({ 
          model: "gemini-pro",
          systemInstruction: "Students will ask you about the subject binary search trees, and you will answer broad topics about this area briefly, in two to three sentences. If questions that deviate from the topic are asked, please reply appropriately."
        });
        setModel(loadedModel);
      };
      initModel();
      
  }, []);

  const handleMessageSend = async (message) => {
    message = `I, the student, asked you a clarification question "` + message + `". Now, give me one brief but intelligible answer without asking a follow-up.`
    setMessages(prev => [...prev, { text: message, fromUser: true }]);

    if (!model) {
      setMessages(prev => [...prev, { text: "The model is not loaded yet.", fromUser: false }]);
      return;
    }

    // Start a chat with the model if it's ready
    try {
      const history = messages.map(message => ({
        role: message.fromUser ? "user" : "model",
        parts: [{ text: message.text }]
      }));
      const chat = await model.startChat({
        history: history,
        // generationConfig: {
        //   maxOutputTokens: 100,
        // },
      });

      // streaming
      const result = await chat.sendMessageStream(message);
      let text = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        

        console.log(chunkText);
        if (text === '') {
          // need to initialize state with new chunk
          setMessages(prev => [...prev, { text, fromUser: false }]);
        }
        // add word by word to the last message when printing it out
        // setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + chunkText, fromUser: false }])
        // Split chunk into words
        
        const words = chunkText.split(' ');

        for (let word of words) {
          // add word by word to the last message when printing it out
          word += ' ';
          setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + word, fromUser: false }])
          await new Promise(resolve => setTimeout(resolve, 10)); // Delay to simulate typing
        }
        // for async (const word in words) {
        //   // add word by word to the last message when printing it out
        //   setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + word, fromUser: false }])
        // }
        text += chunkText; // need to update the state here
      }
    } catch (error) {
      console.error("Error communicating with the AI:", error);
      setMessages(prev => [...prev, { text: "Failed to get a response from the AI.", fromUser: false }]);
    }
  };

  // const handleMessageSendAPI = async (message) => {
  //   setMessages(prev => [...prev, { text: message, fromUser: true }]);
  //   // make a request to the API
  //   const request = {"message": message};
  //   const response = await fetch('http://localhost:5001/response_stream/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(request)
  //     });

  //   // streaming
  //   const result = await response;
  //   let text = '';

  //   for await (const chunk of result.stream) {
  //     const chunkText = chunk.text();
      

  //     console.log(chunkText);
  //     if (text === '') {
  //       // need to initialize state with new chunk
  //       setMessages(prev => [...prev, { text, fromUser: false }]);
  //     }
  //     // add word by word to the last message when printing it out
  //     // setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + chunkText, fromUser: false }])
  //     // Split chunk into words
      
  //     const words = chunkText.split(' ');

  //     for (let word of words) {
  //       // add word by word to the last message when printing it out
  //       word += ' ';
  //       setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + word, fromUser: false }])
  //       await new Promise(resolve => setTimeout(resolve, 10)); // Delay to simulate typing
  //     }
  //     // for async (const word in words) {
  //     //   // add word by word to the last message when printing it out
  //     //   setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + word, fromUser: false }])
  //     // }
  //     text += chunkText; // need to update the state here
  // };
  // // load initial prompt into chat
  // useEffect(() => {
  //   const words = INITIAL_PROMPT.split(' ');
  //   // initialize
  //   setMessages([{ text: '', fromUser: false }]);
  //   for (let word of words) {
  //     // await new Promise(resolve => setTimeout(resolve, 100)); // Delay to simulate typing
  //     setMessages(prevMessages => {
  //       const newMessages = [...prevMessages];
  //       newMessages[newMessages.length - 1].text += word + ' '; // Append the word and a space
  //       return newMessages;
  //     });
  //   }
  // }, []);

  const handleMessageSendAPIStream = async (message) => {
    setMessages(prev => [...prev, { text: message, fromUser: true }]);
    // make a request to the API
    const request = {"message": message}; // TODO: add timestep of video
    const response = await fetch('http://localhost:5111/response_stream/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

    const reader = response.body.getReader();
    let text = '';
    reader.read().then(async function processText({done, value}) {
      if (done) {
          console.log("Stream complete");
          return;
      }

      const chunkText = new TextDecoder("utf-8").decode(value);
      if (text === '') {
        // need to initialize state with new chunk
        setMessages(prev => [...prev, { text, fromUser: false }]);
      }

      // Split chunk into words
      const words = chunkText.split(' ');
      for (let word of words) {
        // add word by word to the last message when printing it out
        word += ' ';
        setMessages(prev => [...prev.slice(0, -1), { text: prev[prev.length - 1].text + word, fromUser: false }])
        await new Promise(resolve => setTimeout(resolve, 10)); // Delay to simulate typing
      }

      text += chunkText;
      // console.log(chunkText);  // Log each chunk

      // Update the messages state with each chunk
      // setMessages(prev => [...prev, { text: chunkText, fromUser: false }]);

      // Read the next chunk
      return reader.read().then(processText);
    });

    const responseData = await response.json();
    console.log(responseData);
    setMessages(prev => [...prev, { text: responseData.response, fromUser: false }]);
  };

  return (
    <>
    <Grid container component={Paper} sx={{ height: '100%' }} elevation={0}  style={{ backgroundColor: '#282828' , borderRadius: 10, color:"white"}}>
      <Grid item xs={12} sx={{ overflowY: 'auto', height: 'calc(100% - 4rem)', color:"white"}}>
        <Typography variant="body" color='white'>
          <p style={{ padding:"1em", paddingTop:"0em", textAlign: 'left' }} > Chat to clarify key concepts, review background knowledge, and discover ideas beyond the material. Happy Learning! </p>
        </Typography>
        {messages.map((message, index) => (
          <Typography key={index} sx={{ margin: '1rem', borderBottom: '0.5px solid rgba(255, 255, 255, 0.3)',  textAlign: message.fromUser ? 'right' : 'left', color:"white" }}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </Typography>
        ))}
      </Grid>
      <Grid item xs={12} sx={{ padding: '1rem', color:"white" }}>
        <TextField
          InputProps={{
            style: { color: 'white', marginBottom: "1em"},
            startAdornment: (
              <InputAdornment position="start" style={{ color: 'white', marginBottom: "1.5em", marginTop: "1.5em" }}>
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          variant="standard"
          fullWidth
          multiline
          color="primary" focused
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleMessageSendAPIStream(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const input = document.getElementById('chat-input');
            handleMessageSend(input.value);
            input.value = '';
          }}
          sx={{ marginTop: '1rem' }}
        >
          Send
        </Button>
      </Grid>
    </Grid>

    </>
  )
}

export default ChatBox;