# Image Captioning using PyTorch

<p align="center">
  A deep learning project that automatically generates natural language descriptions for images using PyTorch
</p>

<p align="center">
  <a href="#about"><strong>About</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#setup"><strong>Setup</strong></a> ·
  <a href="#team"><strong>Team</strong></a>
</p>

## About

This project is developed as part of our B.Tech final year project. It implements an image captioning system that combines computer vision and natural language processing to automatically generate descriptive captions for images.

## Features

- Automatic caption generation for input images
- CNN-based image feature extraction
- LSTM-based caption generation
- Support for multiple image formats
- Pre-trained models for quick inference
- User-friendly interface for testing

## Tech Stack

- PyTorch - Deep learning framework
- Python 3.x
- CUDA (for GPU support)
- ResNet/VGG (for image feature extraction)
- LSTM (for caption generation)
- [Additional dependencies will be listed in requirements.txt]

## Setup

1. Clone the repository
```bash
git clone https://github.com/[username]/g26-img-captioning.git
cd g26-img-captioning
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Download pre-trained models
```bash
python scripts/download_models.py
```

5. Run the application
```bash
python main.py
```

## Team

- [Dhyey Kathiriya]
- [Riya Mehta]
- [Kush Nadpara]

Under the guidance of:
Prof. Kunal Garud
B.Tech. CSE
ICT Ganpat University

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# ict-gnu-final-sem-project-2015-ibm-g26-img-captioning
