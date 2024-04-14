import pathlib
import textwrap
import os
import time
import sys
import cv2
from skimage.metrics import structural_similarity as ssim

import google.generativeai as genai

# from IPython.display import display
# from IPython.display import Markdown
import pdb

API_KEY = os.environ["SPGEMINIKEY"]
video_file_name = "../../gemini-bridge-simple/videos/bst.mp4"
frames_folder = "frames/"


def make_request(prompt, files):
    request = [prompt]
    for file in files:
        request.append(file)
    return request

class Model:

# 1) Learning Objectives
#                             2) Instructor Questions and Solutions
#                             3) A video provided by the instructor that I (the student) will watch
    

    def __init__(self):
        # initialize Gemini API

        try:

            genai.configure(api_key=API_KEY)
            self.model = genai.GenerativeModel('models/gemini-1.5-pro-latest',
            system_instruction="""You are a personalized teaching aide that helps me, the student, learn at my own pace. 
                                You will be given a set of learning objective and image frames from a short lecture video;
                                From these resources, generate at-most specific five questions extracted from the given lecture frames directly
                                that assess understanding of the learning objective. Share these with me (the student) one by one. If I answer well
                                to a lecture-based question, move to the next lecture-based question for the next objective. If not, 
                                make personalized questions based around my knowledge gap, which are adjusted and slightly easier to the lecture-based
                                questions, and ask one or two of those with accompanying information to support my learning. 
                                Do not label what you are asking (lecture-based or personalized question) and keep them all a similar format, simple and natural.
                                Do not mention lecture frames or image frames to me, the student. Instead, say if the content to review is early, middle, or late in the given lecture video based on its frame images.
                                Once I succeed at all learning objectives, you can mention that I have a strong understanding and finish.
                                """)
            # 
            with open('EECS280/first_prompt.txt', 'r') as file:
                # Read the entire contents of the file as a single string
                first_prompt = file.read()
                
            # print(first_prompt)
            # print(file_contents)
            # request = make_request(first_prompt, uploaded_files)
            # request = make_request(first_prompt)
            self.chat = self.model.start_chat(history=[])
            time.sleep(1)
            print("Gemini AI Update: Bridged a new chat with Gemini!")
            self.current_questionID = 1
            # self.chat.send_message(first_prompt)
           #  time.sleep(1)

            video_path = video_file_name
            output_path = "../../gemini-bridge-simple/api/EECS280/frames"
            self.extract_frames(video_path, output_path)

            uploaded_files = []

            folder_dir = "../../gemini-bridge-simple/api/EECS280/frames/"
            idx = 0
            for f in os.listdir(folder_dir):
                idx += 1
                # self.chat.send_message("Next, I will send an image that is lecture frame image number " + str(idx) + ". Use that image to understand the lecture content from which you generate questions.")
                # time.sleep(1)
                uploaded_files.append(genai.upload_file(path=os.path.join(folder_dir, f), display_name="Sample drawing"))
                time.sleep(1)

            print("Gemini AI Update: Uploaded files to Gemini!")

            request = make_request(first_prompt, uploaded_files)
            self.chat.send_message(request)

        except Exception as e:
            print(f"Error: {str(e)}")

            genai.configure(api_key="???")
            self.model = genai.GenerativeModel('models/gemini-1.5-pro-latest',
            system_instruction="""You are a personalized teaching aide that helps me, the student, learn at my own pace. 
                                You will be given a set of learning objective and image frames from a short lecture video;
                                From these resources, generate at-most specific five questions extracted from the given lecture frames directly
                                that assess understanding of the learning objective. Share these with me (the student) one by one. If I answer well
                                to a lecture-based question, move to the next lecture-based question for the next objective. If not, 
                                make personalized questions based around my knowledge gap, which are adjusted and slightly easier to the lecture-based
                                questions, and ask one or two of those with accompanying information to support my learning. 
                                Do not label what you are asking (lecture-based or personalized question) and keep them all a similar format, simple and natural.
                                Do not mention lecture frames or image frames to me, the student. Instead, say if it's early, middle, or late in the given lecture video.
                                Once I succeed at all learning objectives, you can mention that I have a strong understanding and finish.
                                """)
            # 
            with open('EECS280/first_prompt.txt', 'r') as file:
                # Read the entire contents of the file as a single string
                first_prompt = file.read()
                
            # print(first_prompt)
            # print(file_contents)
            # request = make_request(first_prompt, uploaded_files)
            # request = make_request(first_prompt)
            self.chat = self.model.start_chat(history=[])
            time.sleep(1)
            print("Gemini AI Update: Bridged a new chat with Gemini!")
            self.current_questionID = 1
            # self.chat.send_message(first_prompt)
           #  time.sleep(1)

            video_path = video_file_name
            output_path = "../../gemini-bridge-simple/api/EECS280/frames"
            self.extract_frames(video_path, output_path)

            uploaded_files = []

            folder_dir = "../../gemini-bridge-simple/api/EECS280/frames/"
            idx = 0
            for f in os.listdir(folder_dir):
                idx += 1
                # self.chat.send_message("Next, I will send an image that is lecture frame image number " + str(idx) + ". Use that image to understand the lecture content from which you generate questions.")
                # time.sleep(1)
                uploaded_files.append(genai.upload_file(path=os.path.join(folder_dir, f), display_name="Sample drawing"))
                time.sleep(1)

            print("Gemini AI Update: Uploaded files to Gemini!")

            request = make_request(first_prompt, uploaded_files)
            self.chat.send_message(request)



    def make_request(prompt, files):
        request = [prompt]
        for file in files:
            request.append(file.response)
        return request

    def is_new_slide(self, frame1, frame2, threshold=0.9):
        # Convert frames to grayscale
        gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
        
        # Compute Structural Similarity Index (SSI)
        score, _ = ssim(gray1, gray2, full=True)
        
        # If the SSI is below the threshold, consider it a new slide
        return score < threshold

    def extract_frames(self, video_path, output_path = "../../gemini-bridge-simple/api/EECS280/frames"):

        if len(os.listdir(output_path)) > 4:
            return

        for f in os.listdir(output_path):
            os.remove(os.path.join(output_path, f))

        # Open the video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Error: Couldn't open the video file")
            return

        # Read the video frame by frame
        frame_count = 0
        prev_frame = None
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # If it's the first frame, or the frame is significantly different, save it
            if prev_frame is None or frame_count % 5000 == 0: #or self.is_new_slide(prev_frame, frame, 0.9):
                if (prev_frame is None):
                    # Save the frame as an image
                    frame_output_path = f"../../gemini-bridge-simple/api/EECS280/frames/frame_{frame_count}.jpg"
                    cv2.imwrite(frame_output_path, frame)

                    # Update the previous frame
                    prev_frame = frame
                    
                    # Show progress
                    print(f"Frame {frame_count} extracted")
                elif self.is_new_slide(prev_frame, frame, 0.95):
                    # Save the frame as an image
                    frame_output_path = f"../../gemini-bridge-simple/api/EECS280/frames/frame_{frame_count}.jpg"
                    cv2.imwrite(frame_output_path, frame)

                    # Update the previous frame
                    prev_frame = frame
                    
                    # Show progress
                    print(f"Frame {frame_count} extracted")
                
            frame_count += 1
        
        # Release the video capture object
        cap.release()
        print("Frames extraction completed")

    def get_response(self, message):
        response = self.chat.send_message(message)
        return response.text

    def get_response_stream(self, message):
        response = self.chat.send_message(message, stream=True)
        for chunk in response:
            yield chunk.text

            
    def get_feedback(self, answer):
        """Returns feedback on the current question from the user's answer."""
        prompt = f"""
            Student answer to question {self.current_question} is {answer}. Based on this,
            state whether the student answer is correct or incorrect, and provide one sentence of reasoning.
        """
        return self.get_response(prompt)


    def get_next_question(self, answer, question):
        """Returns the next question, either generated by Gemini or the instructor."""
        prompt_one = f"""
            I am a student, and my answer answer to the question "{question}" is "{answer}".
            Based on the my answer, determine if it is correct or incorrect and explain why. 
            Then, generate the next question accordingly. If my answer was mostly correct,
            ask another instructor solution (if all are done, then inform that the assessing is complete). If 
            their answer wasn't mostly correct, give feedback and clarifications, and then 
            ask a question tailored to the component they missed. If you've lingered in one area a lot, then move 
            on to the next instructor question or finish up. Do not inform me (the student) if you are asking an 
            instructor question, and keep the total content you output brief to two or three sentences.

            """
        prompt_two = """
            YOU MUST ADHERE TO THIS JSON OUTPUT FORMAT:
            {
                "id": "VALUE",
                "title": "VALUE",
                "question_background": [list of strings],
                "question": "VALUE",
                "answer": "VALUE",
                "explanation": "VALUE",
                "learning_objectives": [list of integers]
            }
        """
        return self.get_response(prompt_one)

model = Model()