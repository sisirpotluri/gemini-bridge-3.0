import React from 'react';

import './VideoPlayer.css'; 

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/joy/Typography';


// chapter_dict={chapter_dict} curr_module={curr_module}
function VideoPlayer({ structure, videoSrc, chapter_dict, curr_module }) {

  const submodule = chapter_dict.submodules[curr_module];
  const chapter = 21;
  return (
    <Card sx={{ maxWidth: 1200}} elevation={0} style={{ borderRadius: 10, backgroundColor: '#282828' }}>
      <CardMedia
        component="video"
        alt="module_video"
        /*height="500"*/
        src={submodule.content.video_link}
        controls
      />
      <CardContent >
        <Typography gutterBottom component="div" sx={{ color: "white", fontWeight: 'bold', paddingTop:"0.5em", paddingBottom:"0.2em"}}>
          Module 21.1 ({submodule.title})
        </Typography>
        <Typography gutterBottom component="div" sx={{ color: "grey", paddingTop:"0.2em", paddingBottom:"0em"}}>
          {structure.course}, Unit {chapter} ({chapter_dict.title})
        </Typography>
      </CardContent>
    </Card>
  );
}

// function VideoPlayer({videoPath}) {
//   return (
//     // <CardMedia src='./videos/bst.mp4'>
//     //   {/* <video width="320" height="240" controls>
//     //     <source src='./videos/bst.mp4' type='video/mp4'></source>
//     //   </video> */}
//     // </CardMedia>
//     <CardMedia
//       component='video'
//       image={"./videos/bst.mp4"}
//     />
//       // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//     // <div className="video-player">
//     //   <iframe
//     //     src="videos/bst.mp4"
//     //     // frameborder='0'
//     //     // allow="accelerometer; encrypted-media"
//     //     // allowfullscreen
//     //     // title='video'
//     //   />
//     // </div>
//   );
// }

export default VideoPlayer;