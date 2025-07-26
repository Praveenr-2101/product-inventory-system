import base64
import io
import sys
from django.core.files.uploadedfile import InMemoryUploadedFile

def decode_base64_image(image_data: str, field_name="ProductImage") -> InMemoryUploadedFile | None:
    if not image_data or not image_data.startswith("data:image"):
        return None

    try:
        format, imgstr = image_data.split(";base64,")
        ext = format.split("/")[-1]
        image_bytes = base64.b64decode(imgstr)
        image_io = io.BytesIO(image_bytes)
        image_file = InMemoryUploadedFile(
            file=image_io,
            field_name=field_name,
            name=f"{field_name.lower()}.{ext}",
            content_type=f"image/{ext}",
            size=sys.getsizeof(image_bytes),
            charset=None,
        )
        return image_file
    except Exception as e:
        return None 
