import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { decode } from 'base64-arraybuffer';
import { classifyAudio } from '../lib/gemini';
import { supabase } from '../lib/supabase';

export function useScanner(userId) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState('idle');
  const [countdown, setCountdown] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');
  
  const recordingRef = useRef(null);
  const [audioUri, setAudioUri] = useState(null);
  const [base64AudioData, setBase64AudioData] = useState(null);
  const [location, setLocation] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    return () => { 
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {}); 
    };
  }, []);

  const startScan = async () => {
    if (step !== 'idle' && step !== 'consent') return;
    if (!userId) { 
      Alert.alert('Authentication Required', 'Please sign in from the Profile tab to scan and upload noise logs.'); 
      return; 
    }

    try {
      if (await AsyncStorage.getItem('quietzone_consent') !== 'true') { 
        setStep('consent'); 
        return; 
      }
    } catch (err) { 
      console.warn('Failed to read consent state', err); 
    }

    try {
      setErrorMsg(''); setStep('idle');
      
      const audioPerm = await Audio.requestPermissionsAsync();
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (audioPerm.status !== 'granted' || locPerm.status !== 'granted') {
        throw new Error('Microphone and Location permissions are required to scan.');
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;

      setStep('recording'); setCountdown(5);

      const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      for (let i = 5; i > 0; i--) { 
        setCountdown(i); 
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      recordingRef.current = null;

      setLocation(await locPromise);
      setStep('analyzing');
      
      const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : (Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4');
      const audioResponse = await fetch(uri);
      const audioBlob = await audioResponse.blob();
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });
      
      setBase64AudioData(base64Audio);
      setAnalysis(await classifyAudio(base64Audio, mimeType));
      setStep('confirmation');

    } catch (err) {
      if (recordingRef.current) { 
        await recordingRef.current.stopAndUnloadAsync().catch(() => {}); 
        recordingRef.current = null; 
      }
      setErrorMsg(err.message || 'An error occurred during scanning.');
      setStep('idle');
    }
  };

  const cancelScan = async () => {
    if (recordingRef.current) { 
      await recordingRef.current.stopAndUnloadAsync().catch(() => {}); 
      recordingRef.current = null; 
    }
    setStep('idle'); 
    setErrorMsg(''); 
    setAudioUri(null); 
    setAnalysis(null);
  };

  const agreeToConsent = async () => {
    try { 
      await AsyncStorage.setItem('quietzone_consent', 'true'); 
      startScan(); 
    } catch (err) { 
      Alert.alert('Error', 'Could not save consent status.'); 
    }
  };

  const uploadAndConfirm = async () => {
    try {
      setStep('uploading');
      const scanId = Math.random().toString(36).substring(2, 15);
      const filePath = `${userId}/${scanId}.m4a`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(filePath, decode(base64AudioData), { 
          contentType: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4', 
          upsert: false 
        });
      
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('noise_logs').insert({
        user_id: userId, 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude,
        source: analysis.source, 
        disruption_score: analysis.disruption_score, 
        description: analysis.description, 
        audio_path: uploadData.path
      });
      
      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['noise_logs'] });
      Alert.alert("Success", "Noise log added to the map!");
      setStep('idle');
    } catch (err) {
      Alert.alert("Upload Failed", err.message);
      setStep('confirmation');
    }
  };

  return {
    step,
    setStep,
    countdown,
    errorMsg,
    analysis,
    setAnalysis,
    startScan,
    cancelScan,
    agreeToConsent,
    uploadAndConfirm
  };
}
