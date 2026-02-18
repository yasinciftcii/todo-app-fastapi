import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlmodel import SQLModel
import os
import json
from dotenv import load_dotenv

# .env dosyasını yükle (Local geliştirme için)
load_dotenv()

# 1. Firebase Admin SDK Başlatma
def initialize_firebase():
    """Initializes Firebase from Environment Variable (Prod) or Local File (Dev)."""
    try:
        if not firebase_admin._apps:
            # Seçenek A: Raw JSON String (Render/Vercel gibi yerlerde Environment Variable olarak)
            firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
            
            # Seçenek B: Dosya Yolu (Localde .env dosyasından okunur)
            firebase_creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

            if firebase_creds_json:
                # JSON stringini dictionary'ye çevir
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized via JSON Environment Variable.")
            
            elif firebase_creds_path and os.path.exists(firebase_creds_path):
                # Belirtilen dosya yolundan oku
                cred = credentials.Certificate(firebase_creds_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase Admin SDK initialized via File Path: {firebase_creds_path}")
                
            else:
                # Son çare: Varsayılan dosya adına bak
                default_file = "serviceAccountKey.json"
                if os.path.exists(default_file):
                    cred = credentials.Certificate(default_file)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized via default local file.")
                else:
                    print("WARNING: No Firebase credentials found! Check your .env file.")

    except Exception as e:
        print(f"FATAL ERROR: Could not initialize Firebase. {e}")

# User model
class User(SQLModel):
    uid: str
    email: str

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 2. Dependency
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token missing.")

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', 'N/A')
        return User(uid=uid, email=email)
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {e}")