# DamageX - Vehicle Damage Detection System

An AI-powered vehicle damage detection and classification system using deep learning. The system can identify and classify damage on vehicle fronts and rears into different categories.

## 🚗 Overview

DamageX uses a fine-tuned ResNet-50 model to classify vehicle images into 6 categories:

| Category   | Description              |
| ---------- | ------------------------ |
| F_Breakage | Front breakage damage    |
| F_Crushed  | Front crushed damage     |
| F_Normal   | Normal front (no damage) |
| R_Breakage | Rear breakage damage     |
| R_Crushed  | Rear crushed damage      |
| R_Normal   | Normal rear (no damage)  |

## 📁 Project Structure

```
damagex/
├── README.md
├── training/
│   ├── damage_detection.ipynb      # Main training notebook
│   ├── hyperparameter_tunning.ipynb # Optuna hyperparameter optimization
│   ├── saved_model.pth             # Trained model weights
│   └── dataset/                    # Training dataset
│       ├── F_Breakage/
│       ├── F_Crushed/
│       ├── F_Normal/
│       ├── R_Breakage/
│       ├── R_Crushed/
│       └── R_Normal/
└── web/                            # Next.js web application (coming soon)
```

---

## 🧠 Model Training

### Requirements

```bash
pip install torch torchvision matplotlib numpy scikit-learn optuna
```

### Dataset Structure

Organize your dataset in the following structure:

```
dataset/
├── F_Breakage/    # Images of front breakage damage
├── F_Crushed/     # Images of front crushed damage
├── F_Normal/      # Images of normal front
├── R_Breakage/    # Images of rear breakage damage
├── R_Crushed/     # Images of rear crushed damage
└── R_Normal/      # Images of normal rear
```

### Training Process

1. **Data Preprocessing**

   - Images resized to 224x224
   - Data augmentation: horizontal flip, rotation, color jitter
   - Normalization with ImageNet statistics

2. **Models Explored**

   - Custom CNN (baseline)
   - CNN with BatchNorm & Dropout
   - EfficientNet-B0 (transfer learning)
   - **ResNet-50 (best performance)** ✅

3. **Hyperparameter Tuning**

   - Run `hyperparameter_tunning.ipynb` to find optimal learning rate and dropout
   - Uses Optuna with 10 trials
   - Optimizes for validation accuracy

4. **Final Training**
   - Run `damage_detection.ipynb` with tuned hyperparameters
   - Model saved to `saved_model.pth`

### Running Training

```bash
cd training
jupyter notebook damage_detection.ipynb
```

### Model Performance

The ResNet-50 model achieves high accuracy on the validation set. See the confusion matrix and classification report in the training notebook for detailed metrics.

---

## 🌐 Web Application (Next.js)

A Next.js web application for real-time vehicle damage detection.

### Features (Planned)

- 📤 Image upload for damage detection
- 📸 Camera capture support
- 🔍 Real-time classification results
- 📊 Confidence scores for each category
- 📱 Responsive design for mobile and desktop

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend API**: Next.js API Routes
- **ML Inference**: Python FastAPI / ONNX Runtime
- **Styling**: Tailwind CSS, shadcn/ui

### Setup (Coming Soon)

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### API Endpoints (Planned)

| Endpoint       | Method | Description                            |
| -------------- | ------ | -------------------------------------- |
| `/api/predict` | POST   | Upload image for damage classification |
| `/api/health`  | GET    | Check API health status                |

### Deployment

The application can be deployed on:

- Vercel (recommended for Next.js)
- Docker container
- Any Node.js hosting platform

---

## 🛠️ Development

### Prerequisites

- Python 3.8+
- PyTorch 2.0+
- Node.js 18+
- CUDA (optional, for GPU training)

### Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/damagex.git
   cd damagex
   ```

2. Train the model (or use pretrained weights)

   ```bash
   cd training
   jupyter notebook damage_detection.ipynb
   ```

3. Start the web application
   ```bash
   cd web
   npm install
   npm run dev
   ```

---

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
