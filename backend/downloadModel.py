from huggingface_hub import hf_hub_download

# Define the target directory
target_dir = "/home/indah-mbah/Desktop/EduTrack/backend"

# Download the model and save it to the specified directory
model_path = hf_hub_download(repo_id="arnabdhar/YOLOv8-Face-Detection", filename="model.pt", local_dir=target_dir)

print(f"Model downloaded to: {model_path}")
