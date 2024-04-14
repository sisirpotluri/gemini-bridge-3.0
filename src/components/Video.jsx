import { useEffect, useRef } from 'react';

export default function Video ({videoUrl}) {
  return (
    <iframe
        src='https://www.youtube.com/embed/E7wJTI-1dvQ'
        frameborder='0'
        allow='autoplay; encrypted-media'
        allowfullscreen
        title='video'
    />
  );
}