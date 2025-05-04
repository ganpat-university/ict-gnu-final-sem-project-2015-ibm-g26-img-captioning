from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pickle
import uvicorn
from io import BytesIO

app = FastAPI()

# Allow all CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and tokenizer
mobilenet_model = MobileNetV2(weights="imagenet")
mobilenet_model = tf.keras.Model(inputs=mobilenet_model.inputs, outputs=mobilenet_model.layers[-2].output)
model = load_model('mymodel.h5')

with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)

max_caption_length = 34

def get_word_from_index(index):
    return next((word for word, idx in tokenizer.word_index.items() if idx == index), None)

def predict_caption(model, image_features):
    caption = "startseq"
    for _ in range(max_caption_length):
        sequence = tokenizer.texts_to_sequences([caption])[0]
        sequence = pad_sequences([sequence], maxlen=max_caption_length)
        yhat = model.predict([image_features, sequence], verbose=0)
        predicted_index = np.argmax(yhat)
        predicted_word = get_word_from_index(predicted_index)
        if predicted_word is None or predicted_word == "endseq":
            break
        caption += " " + predicted_word
    return caption.replace("startseq", "").replace("endseq", "").strip()

@app.post("/generate-caption")
async def generate_caption(file: UploadFile = File(...)):
    content = await file.read()
    image = load_img(BytesIO(content), target_size=(224, 224))
    image = img_to_array(image)
    image = image.reshape((1, *image.shape))
    image = preprocess_input(image)
    image_features = mobilenet_model.predict(image, verbose=0)
    caption = predict_caption(model, image_features)
    return {"caption": caption}
