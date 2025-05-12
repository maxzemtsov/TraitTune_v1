# /home/ubuntu/traittune/backend/src/qr_code_handler.py

import qrcode
import io

class QRCodeHandler:
    def generate_qr_code_image(self, data: str, image_format: str = "PNG") -> bytes:
        """Generates a QR code image and returns it as bytes."""
        img = qrcode.make(data)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=image_format)
        img_byte_arr = img_byte_arr.getvalue()
        return img_byte_arr

# Example Usage (for testing, not part of the service typically)
if __name__ == "__main__":
    handler = QRCodeHandler()
    qr_data_url = "https://traittune.com/qr/sample-qr-token-for-testing"
    image_bytes = handler.generate_qr_code_image(qr_data_url)
    
    # To save it to a file for verification:
    with open("/home/ubuntu/sample_qr_code.png", "wb") as f:
        f.write(image_bytes)
    print(f"Sample QR code saved to /home/ubuntu/sample_qr_code.png for data: {qr_data_url}")

