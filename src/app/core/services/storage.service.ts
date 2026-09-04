import { inject, Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import { FirebaseAppService } from './firebase-app.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage: FirebaseStorage = getStorage(inject(FirebaseAppService).app);
  private readonly configured = !!environment.firebase.storageBucket &&
    !environment.firebase.storageBucket.startsWith('YOUR_');

  async uploadExerciseImage(exerciseId: string, file: File): Promise<string> {
    if (!this.configured) {
      throw new Error('Firebase Storage is not configured for this project yet.');
    }
    const path = `exercises/${exerciseId}/${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
