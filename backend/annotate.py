import os
from pathlib import Path
from ultralytics import YOLO
from PIL import Image

# Load YOLOv8-Face model (force CPU)
model = YOLO("model.pt")
model.to("cpu")

# Define dataset path
dataset_path = Path("/home/indah-mbah/Desktop/EduTrack/backend/dataset")  # Update this path
labels_path = dataset_path.parent / "labels"  # Labels folder will be next to dataset

# Recursively process all images inside subdirectories
for image_path in dataset_path.glob("**/*.jpg"):  # Modify for .jpeg or .png if needed
    image_name = image_path.name

    # Run inference (face detection)
    results = model.predict(str(image_path), device="cpu")

    # Extract bounding boxes and convert to YOLO format
    annotations = []
    for box in results[0].boxes.xyxy:
        x1, y1, x2, y2 = box.tolist()
        image = Image.open(image_path)
        width, height = image.size  # Get actual image size

        # Convert bounding box to YOLO format
        x_center = (x1 + x2) / 2.0 / width
        y_center = (y1 + y2) / 2.0 / height
        w = (x2 - x1) / width
        h = (y2 - y1) / height
        annotations.append(f"0 {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}")

    # Create the same folder structure in `labels/`
    relative_path = image_path.relative_to(dataset_path).parent
    label_dir = labels_path / relative_path
    label_dir.mkdir(exist_ok=True, parents=True)  # Ensure subfolders are created

    label_file = label_dir / f"{image_path.stem}.txt"
    with open(label_file, "w") as f:
        if annotations:
            f.write("\n".join(annotations))
            print(f"✅ Saved annotation: {label_file}")
        else:
            print(f"⚠ No faces detected in: {image_name}")

print("🚀 Auto-annotation completed! Labels stored in:", labels_path)
