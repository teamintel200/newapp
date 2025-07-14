"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Pause,
  Volume2,
  Video,
  CheckCircle,
  Loader2,
  Share2
} from "lucide-react";

export default function RenderPage() {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [projectId, setProjectId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Load data from localStorage on component mount
  React.useEffect(() => {
    const savedSections = localStorage.getItem('videoSections');
    const savedGlobalSettings = localStorage.getItem('globalSettings');
    const savedProjectId = localStorage.getItem('projectId');
    
    if (savedSections) {
      try {
        setSections(JSON.parse(savedSections));
      } catch (error) {
        console.error('Error parsing saved sections:', error);
      }
    }
    
    if (savedGlobalSettings) {
      try {
        setGlobalSettings(JSON.parse(savedGlobalSettings));
      } catch (error) {
        console.error('Error parsing saved global settings:', error);
      }
    }

    if (savedProjectId) {
      setProjectId(savedProjectId);
    }

    // If no sections found, redirect back to create page
    if (!savedSections || !savedProjectId) {
      window.location.href = '/create';
    }
  }, []);

  const handleStartRender = async () => {
    if (!projectId) {
      alert('프로젝트 ID가 없습니다. 처음부터 다시 시작해주세요.');
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add project ID
      formData.append('tempDirName', projectId);
      
      // Add segments data as JSON string
      const segments = sections.map(section => ({
        id: section.id,
        //title: section.title,
        text: section.text,
        // voiceSettings: section.voiceSettings || {
        //   speed: 1,
        //   gender: 'female',
        //   accent: 'american'
        // }
      }));
      formData.append('segments', JSON.stringify(segments));
      
      // Add global settings as JSON string
      const globalSettingsData = {
        videoTitle: globalSettings.videoTitle || 'My YouTube Short',
        aspectRatio: globalSettings.aspectRatio || '9:16',
        outputQuality: globalSettings.outputQuality || 'FHD',
        background: globalSettings.background || 'black',
        brightness: globalSettings.brightness || 100,
        contrast: globalSettings.contrast || 100,
        saturation: globalSettings.saturation || 100,
        musicVolume: globalSettings.musicVolume || 50,
        voiceVolume: globalSettings.voiceVolume || 80,
        watermark: globalSettings.watermark || ''
      };
      formData.append('globalSettings', JSON.stringify(globalSettingsData));
      
      // Helper function to convert base64 to blob
      const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      };
      
      // Add global background image if exists
      if (globalSettings.background === 'custom' && globalSettings.customBackgroundImage) {
        const globalBackgroundBlob = base64ToBlob(globalSettings.customBackgroundImage);
        formData.append('images', globalBackgroundBlob, 'global-background.jpg');
      }
      
      // Add section images
      sections.forEach((section, index) => {
        if (section.image) {
          const sectionImageBlob = base64ToBlob(section.image);
          formData.append('images', sectionImageBlob, `section-${index + 1}.jpg`);
        }
      });

      // Call generate API
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!generateResponse.ok) {
        throw new Error('비디오 생성에 실패했습니다.');
      }

      const { fileName: responseFileName } = await generateResponse.json();
      setFileName(responseFileName);
      
      // Simulate progress for user experience
      const interval = setInterval(() => {
        setRenderProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRendering(false);
            setIsComplete(true);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 300);

    } catch (error) {
      console.error('Error generating video:', error);
      alert('비디오 생성 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  const handleBack = () => {
    window.location.href = '/segments';
  };

  const handleDownload = async () => {
    if (!fileName) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      const response = await fetch(`/api/download/${fileName}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('파일 다운로드에 실패했습니다.');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${globalSettings.videoTitle || 'my-youtube-short'}.mp4`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('비디오 다운로드 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  };

  // Calculate video duration and format sections for display
  const sectionsWithDuration = sections.map((section, index) => ({
    ...section,
    duration: `${Math.max(2, Math.ceil(section.text?.length / 20) || 3)}s`
  }));

  const totalDuration = sectionsWithDuration.reduce((total, section) => {
    return total + parseInt(section.duration);
  }, 0);

  const videoTitle = globalSettings.videoTitle || 'My YouTube Short';
  const aspectRatio = globalSettings.aspectRatio || '9:16';
  const outputQuality = globalSettings.outputQuality || 'FHD';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editing
              </Button>
              <h1 className="text-2xl font-bold">Render Video</h1>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">3</Badge>
              <span className="text-sm font-medium">Final Render</span>
            </div>
            <Progress value={100} className="flex-1 max-w-md" />
            <span className="text-sm text-muted-foreground">Step 3 of 3</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Video Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Video Player Mockup */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <h3 className="text-lg font-semibold mb-2">{videoTitle}</h3>
                        <p className="text-sm opacity-80">{aspectRatio} • {outputQuality} • {totalDuration} seconds</p>
                      </div>
                    </div>
                    
                    {/* Play Button Overlay */}
                    {!isPlaying && !isRendering && isComplete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play className="h-8 w-8 text-white" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Rendering Overlay */}
                    {isRendering && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                          <p className="text-sm">Rendering video...</p>
                          <p className="text-xs opacity-80">{Math.round(renderProgress)}% complete</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={!isComplete}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isComplete}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Render Status */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Render Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isComplete && !isRendering ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Ready to Render</h3>
                      <p className="text-muted-foreground mb-6">
                        Your video is configured and ready to be rendered. This process typically takes 1-2 minutes.
                      </p>
                      <Button onClick={handleStartRender} className="bg-primary hover:bg-primary/90">
                        <Video className="w-4 h-4 mr-2" />
                        Start Rendering
                      </Button>
                    </div>
                  ) : isRendering ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="font-medium">Rendering your video...</span>
                      </div>
                      <Progress value={renderProgress} className="w-full" />
                      <div className="text-sm text-muted-foreground">
                        {Math.round(renderProgress)}% complete • Estimated time remaining: {Math.max(0, Math.round((100 - renderProgress) / 10))} seconds
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold mb-2">Render Complete!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your YouTube Short is ready for download and sharing.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          onClick={handleDownload} 
                          disabled={!fileName}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Video
                        </Button>
                        <Button variant="outline">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Video Details */}
            <div className="space-y-6">
              {/* Video Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{videoTitle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{totalDuration} seconds</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium">MP4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolution:</span>
                      <span className="font-medium">
                        {aspectRatio === '9:16' ? '1080x1920' : aspectRatio === '16:9' ? '1920x1080' : '1080x1080'} ({aspectRatio})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quality:</span>
                      <span className="font-medium">{outputQuality === 'FHD' ? 'Full HD' : outputQuality}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium">~{Math.ceil(totalDuration * 0.8)} MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sections:</span>
                      <span className="font-medium">{sections.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sections Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectionsWithDuration.map((section, index) => (
                      <div key={section.id || index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="secondary" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium mb-1">{section.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {section.text}
                          </p>
                          <span className="text-xs text-primary font-medium">{section.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">🎬 For YouTube Shorts</h4>
                    <p className="text-xs text-muted-foreground">
                      Optimized 9:16 format, perfect for YouTube Shorts upload
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">📱 For Social Media</h4>
                    <p className="text-xs text-muted-foreground">
                      Compatible with TikTok, Instagram Reels, and other platforms
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">💾 High Quality</h4>
                    <p className="text-xs text-muted-foreground">
                      Full HD resolution with optimized compression
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}