import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface SettingsDialogProps {
  onSettingsChange: (settings: Record<string, any>) => void;
  currentSettings?: Record<string, any>;
}

export function SettingsDialog({ onSettingsChange, currentSettings = {} }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    // Core Options
    fps: currentSettings.fps || 1.0,
    port: currentSettings.port || 3030,
    dataDir: currentSettings.dataDir || '',
    debug: currentSettings.debug || false,

    // Audio Options
    audioChunkDuration: currentSettings.audioChunkDuration || 30,
    disableAudio: currentSettings.disableAudio || false,
    audioTranscriptionEngine: currentSettings.audioTranscriptionEngine || 'whisper-large-v3-turbo',
    enableRealtimeAudioTranscription: currentSettings.enableRealtimeAudioTranscription || false,

    // Vision Options
    disableVision: currentSettings.disableVision || false,
    videoChunkDuration: currentSettings.videoChunkDuration || 60,
    ocrEngine: currentSettings.ocrEngine || 'tesseract',

    // Privacy Options
    usePiiRemoval: currentSettings.usePiiRemoval || false,

    // VAD Options
    vadEngine: currentSettings.vadEngine || 'silero',
    vadSensitivity: currentSettings.vadSensitivity || 'high',
  });

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon'>
          <Settings className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Screenpipe Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='core' className='w-full'>
          <TabsList className='grid w-full grid-cols-4 mb-6'>
            <TabsTrigger value='core'>Core</TabsTrigger>
            <TabsTrigger value='audio'>Audio</TabsTrigger>
            <TabsTrigger value='vision'>Vision</TabsTrigger>
            <TabsTrigger value='advanced'>Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value='core' className='space-y-6'>
            <div className='space-y-4'>
              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='fps'>FPS</Label>
                <Slider
                  id='fps'
                  min={0.1}
                  max={30}
                  step={0.1}
                  value={[settings.fps]}
                  onValueChange={([value]) => handleChange('fps', value)}
                />
                <p className='text-sm text-muted-foreground'>
                  Current: {settings.fps} FPS (~{Math.round(settings.fps * 30)})
                </p>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='port'>Port</Label>
                <Input
                  id='port'
                  type='number'
                  value={settings.port}
                  onChange={(e) => handleChange('port', parseInt(e.target.value))}
                />
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='dataDir'>Data Directory</Label>
                <Input
                  id='dataDir'
                  placeholder='$HOME/.screenpipe'
                  value={settings.dataDir}
                  onChange={(e) => handleChange('dataDir', e.target.value)}
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='debug'
                  checked={settings.debug}
                  onCheckedChange={(checked) => handleChange('debug', checked)}
                />
                <Label htmlFor='debug'>Enable Debug Logging</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='audio' className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='disableAudio'
                  checked={settings.disableAudio}
                  onCheckedChange={(checked) => handleChange('disableAudio', checked)}
                />
                <Label htmlFor='disableAudio'>Disable Audio Recording</Label>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='audioTranscriptionEngine'>Transcription Engine</Label>
                <Select
                  value={settings.audioTranscriptionEngine}
                  onValueChange={(value) => handleChange('audioTranscriptionEngine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select engine' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='deepgram'>Deepgram (Cloud)</SelectItem>
                    <SelectItem value='whisper-tiny'>Whisper Tiny (Local)</SelectItem>
                    <SelectItem value='whisper-large'>Whisper Large (Local)</SelectItem>
                    <SelectItem value='whisper-large-v3-turbo'>Whisper Large V3 Turbo (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='audioChunkDuration'>Audio Chunk Duration (seconds)</Label>
                <Input
                  id='audioChunkDuration'
                  type='number'
                  value={settings.audioChunkDuration}
                  onChange={(e) => handleChange('audioChunkDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='vision' className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='disableVision'
                  checked={settings.disableVision}
                  onCheckedChange={(checked) => handleChange('disableVision', checked)}
                />
                <Label htmlFor='disableVision'>Disable Vision Recording</Label>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='ocrEngine'>OCR Engine</Label>
                <Select
                  value={settings.ocrEngine}
                  onValueChange={(value) => handleChange('ocrEngine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select OCR engine' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='apple-native'>Apple Native (macOS)</SelectItem>
                    <SelectItem value='windows-native'>Windows Native</SelectItem>
                    <SelectItem value='tesseract'>Tesseract (Linux)</SelectItem>
                    <SelectItem value='unstructured'>Unstructured (Cloud)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='videoChunkDuration'>Video Chunk Duration (seconds)</Label>
                <Input
                  id='videoChunkDuration'
                  type='number'
                  value={settings.videoChunkDuration}
                  onChange={(e) => handleChange('videoChunkDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='advanced' className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='usePiiRemoval'
                  checked={settings.usePiiRemoval}
                  onCheckedChange={(checked) => handleChange('usePiiRemoval', checked)}
                />
                <Label htmlFor='usePiiRemoval'>Enable PII Removal</Label>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='vadEngine'>Voice Activity Detection Engine</Label>
                <Select
                  value={settings.vadEngine}
                  onValueChange={(value) => handleChange('vadEngine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select VAD engine' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='silero'>Silero</SelectItem>
                    <SelectItem value='webrtc'>WebRTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label htmlFor='vadSensitivity'>VAD Sensitivity</Label>
                <Select
                  value={settings.vadSensitivity}
                  onValueChange={(value) => handleChange('vadSensitivity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select sensitivity' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 