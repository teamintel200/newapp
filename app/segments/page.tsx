"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Upload, 
  Volume2, 
  Image as ImageIcon,
  X,
  Eye,
  Settings,
  FileText,
  ArrowLeft,
  ArrowRight,
  Globe
} from 'lucide-react';

interface VoiceSettings {
  speed: number;
  gender: 'male' | 'female';
  accent: 'american' | 'british' | 'australian' | 'canadian';
}

interface Section {
  id: string;
  title: string;
  text: string;
  image?: string;
  voiceSettings?: VoiceSettings;
}

interface GlobalSettings {
  videoTitle: string;
  brightness: number;
  contrast: number;
  saturation: number;
  musicVolume: number;
  voiceVolume: number;
  watermark: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  outputQuality: 'HD' | 'FHD' | '4K';
  background: 'black' | 'white' | 'custom';
  customBackgroundImage?: string;
}

export default function SegmentsPage() {
  // Load sections from localStorage (created from script splitting)
  const [sections, setSections] = useState<Section[]>([]);
  
  // Initialize sections from localStorage on component mount
  React.useEffect(() => {
    const savedSections = localStorage.getItem('videoSections');
    if (savedSections) {
      try {
        const parsedSections = JSON.parse(savedSections);
        setSections(parsedSections);
        // Set the first section as selected once sections are loaded
        if (parsedSections.length > 0) {
          setSelectedSectionId(parsedSections[0].id);
        }
      } catch (error) {
        console.error('Error parsing saved sections:', error);
        // Fallback to default sections if parsing fails
        const fallbackSections: Section[] = [
          {
            id: '1',
            title: 'Section 1',
            text: 'No script data found. Please go back and enter your script.'
          }
        ];
        setSections(fallbackSections);
        setSelectedSectionId('1');
      }
    } else {
      // Redirect back to create page if no sections found
      window.location.href = '/create';
    }
  }, []);

  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    videoTitle: 'My YouTube Short',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    musicVolume: 50,
    voiceVolume: 80,
    watermark: '',
    aspectRatio: '9:16',
    outputQuality: 'FHD',
    background: 'black',
    customBackgroundImage: undefined
  });

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const defaultVoiceSettings: VoiceSettings = {
    speed: 1,
    gender: 'female',
    accent: 'american'
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleGlobalSettingChange('customBackgroundImage', result);
      handleGlobalSettingChange('background', 'custom');
    };
    reader.readAsDataURL(file);
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const handleVoiceSettingChange = (key: keyof VoiceSettings, value: any) => {
    if (!selectedSection) return;
    
    const currentSettings = selectedSection.voiceSettings || defaultVoiceSettings;
    const newSettings = { ...currentSettings, [key]: value };
    
    handleSectionUpdate(selectedSection.id, { voiceSettings: newSettings });
  };

  const handleGlobalSettingChange = (key: keyof GlobalSettings, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSection) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleSectionUpdate(selectedSection.id, { image: result });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !selectedSection) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleSectionUpdate(selectedSection.id, { image: result });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (!selectedSection) return;
    handleSectionUpdate(selectedSection.id, { image: undefined });
  };

  const handleBack = () => {
    window.location.href = '/create';
  };

  const handleContinue = () => {
    // Save the updated sections and global settings before continuing
    localStorage.setItem('videoSections', JSON.stringify(sections));
    localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
    window.location.href = '/render';
  };

  const currentVoiceSettings = selectedSection?.voiceSettings || defaultVoiceSettings;

  // Helper function to get aspect ratio classes and dimensions
  const getPreviewDimensions = () => {
    switch (globalSettings.aspectRatio) {
      case '9:16':
        return { 
          className: 'aspect-[9/16]', 
          width: 270, 
          height: 480 
        };
      case '1:1':
        return { 
          className: 'aspect-square', 
          width: 300, 
          height: 300 
        };
      case '16:9':
      default:
        return { 
          className: 'aspect-video', 
          width: 400, 
          height: 225 
        };
    }
  };

  const previewDimensions = getPreviewDimensions();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Edit Sections</h1>
            </div>
            <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
              Continue to Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">2</Badge>
              <span className="text-sm font-medium">Edit Sections</span>
            </div>
            <Progress value={66.67} className="flex-1 max-w-md" />
            <span className="text-sm text-muted-foreground">Step 2 of 3</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Sections List */}
          <div className="col-span-3 flex flex-col h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sections ({sections.length})
                  </CardTitle>
                  <Button
                    variant={showGlobalSettings ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGlobalSettings(!showGlobalSettings)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      showGlobalSettings 
                        ? 'shadow-md ring-1 ring-primary/30' 
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    Global
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto flex-1 min-h-0">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedSectionId === section.id && !showGlobalSettings
                        ? 'border-primary bg-primary/20 shadow-md ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/50 hover:bg-muted/70 hover:shadow-sm active:bg-muted/90'
                    }`}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setShowGlobalSettings(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={selectedSectionId === section.id && !showGlobalSettings ? "default" : "secondary"} className="text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {section.image && <ImageIcon className="h-3 w-3 text-primary" />}
                        {section.voiceSettings && <Volume2 className="h-3 w-3 text-primary" />}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{section.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{section.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Section Editor or Global Settings */}
          <div className="col-span-6 h-full overflow-y-auto">
            <div className="space-y-6 pb-4">
            {showGlobalSettings ? (
              <>
                {/* Global Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Global Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="video-title">Video Title</Label>
                      <Input
                        id="video-title"
                        value={globalSettings.videoTitle}
                        onChange={(e) => handleGlobalSettingChange('videoTitle', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="watermark">Watermark Text</Label>
                      <Input
                        id="watermark"
                        value={globalSettings.watermark}
                        onChange={(e) => handleGlobalSettingChange('watermark', e.target.value)}
                        placeholder="Optional watermark text"
                        className="mt-1"
                      />
                    </div>

                    {/* Hidden: Aspect Ratio and Output Quality selectors - backend not implemented */}
                    <div className="hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Aspect Ratio</Label>
                          <Select
                            value={globalSettings.aspectRatio}
                            onValueChange={(value) => handleGlobalSettingChange('aspectRatio', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                              <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                              <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Output Quality</Label>
                          <Select
                            value={globalSettings.outputQuality}
                            onValueChange={(value) => handleGlobalSettingChange('outputQuality', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HD">HD (720p)</SelectItem>
                              <SelectItem value="FHD">Full HD (1080p)</SelectItem>
                              <SelectItem value="4K">4K (2160p)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hidden: Video Effects - backend not implemented */}
                <Card className="hidden">
                  <CardHeader>
                    <CardTitle>Video Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Brightness: {globalSettings.brightness}%</Label>
                      <Slider
                        value={[globalSettings.brightness]}
                        onValueChange={([value]) => handleGlobalSettingChange('brightness', value)}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Contrast: {globalSettings.contrast}%</Label>
                      <Slider
                        value={[globalSettings.contrast]}
                        onValueChange={([value]) => handleGlobalSettingChange('contrast', value)}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Saturation: {globalSettings.saturation}%</Label>
                      <Slider
                        value={[globalSettings.saturation]}
                        onValueChange={([value]) => handleGlobalSettingChange('saturation', value)}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Background Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Background Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Background Type</Label>
                      <Select
                        value={globalSettings.background}
                        onValueChange={(value) => handleGlobalSettingChange('background', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="custom">Custom Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {globalSettings.background === 'custom' && (
                      <div>
                        <Label>Background Image</Label>
                        {globalSettings.customBackgroundImage ? (
                          <div className="relative mt-2">
                            <img
                              src={globalSettings.customBackgroundImage}
                              alt="Background"
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                handleGlobalSettingChange('customBackgroundImage', undefined);
                                handleGlobalSettingChange('background', 'black');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBackgroundImageUpload}
                              className="hidden"
                              id="background-upload"
                            />
                            <Button asChild variant="outline" className="w-full">
                              <label htmlFor="background-upload" className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Background Image
                              </label>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Background Preview */}
                    <div>
                      <Label>Background Preview</Label>
                      <div 
                        className="mt-2 h-20 rounded-lg border flex items-center justify-center text-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
                        style={{
                          backgroundColor: globalSettings.background === 'black' ? '#000000' : 
                                         globalSettings.background === 'white' ? '#ffffff' : 'transparent',
                          backgroundImage: globalSettings.background === 'custom' && globalSettings.customBackgroundImage ? 
                                         `url(${globalSettings.customBackgroundImage})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: globalSettings.background === 'white' ? '#000000' : '#ffffff'
                        }}
                      >
                        {globalSettings.background === 'black' && 'Black Background'}
                        {globalSettings.background === 'white' && 'White Background'}
                        {globalSettings.background === 'custom' && !globalSettings.customBackgroundImage && 'No image selected'}
                        {globalSettings.background === 'custom' && globalSettings.customBackgroundImage && 'Custom Background'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hidden: Audio Settings - backend not implemented */}
                <Card className="hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      Global Audio Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Background Music Volume: {globalSettings.musicVolume}%</Label>
                      <Slider
                        value={[globalSettings.musicVolume]}
                        onValueChange={([value]) => handleGlobalSettingChange('musicVolume', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Voice Volume: {globalSettings.voiceVolume}%</Label>
                      <Slider
                        value={[globalSettings.voiceVolume]}
                        onValueChange={([value]) => handleGlobalSettingChange('voiceVolume', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Section Editor */}
                {selectedSection && (
                  <>
                    {/* Section Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Edit Section: {selectedSection.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="section-title">Section Title</Label>
                          <Input
                            id="section-title"
                            value={selectedSection.title}
                            onChange={(e) => handleSectionUpdate(selectedSection.id, { title: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section-text">Section Text</Label>
                          <Textarea
                            id="section-text"
                            value={selectedSection.text}
                            onChange={(e) => handleSectionUpdate(selectedSection.id, { text: e.target.value })}
                            className="mt-1 min-h-[100px]"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Image Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Section Image
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedSection.image ? (
                          <div className="relative">
                            <img
                              src={selectedSection.image}
                              alt="Section"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                              dragActive ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                          >
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">Upload Section Image</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Drag and drop an image here, or click to select
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button asChild variant="outline">
                              <label htmlFor="image-upload" className="cursor-pointer">
                                Select Image
                              </label>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Voice Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Volume2 className="h-5 w-5" />
                          Voice Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label>Speed: {currentVoiceSettings.speed}x</Label>
                          <Slider
                            value={[currentVoiceSettings.speed]}
                            onValueChange={([value]) => handleVoiceSettingChange('speed', value)}
                            min={0.5}
                            max={2}
                            step={0.1}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Gender</Label>
                            <Select
                              value={currentVoiceSettings.gender}
                              onValueChange={(value) => handleVoiceSettingChange('gender', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Accent</Label>
                            <Select
                              value={currentVoiceSettings.accent}
                              onValueChange={(value) => handleVoiceSettingChange('accent', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="american">American</SelectItem>
                                <SelectItem value="british">British</SelectItem>
                                <SelectItem value="australian">Australian</SelectItem>
                                <SelectItem value="canadian">Canadian</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </>
                )}
              </>
            )}
            </div>
          </div>

          {/* Right Panel - Enhanced Preview */}
          <div className="col-span-3 flex flex-col h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
                {showGlobalSettings ? (
                  <div className="space-y-4">
                    {/* Global Settings Preview with Dynamic Aspect Ratio */}
                    <div className={`bg-muted rounded-lg overflow-hidden flex items-center justify-center ${previewDimensions.className}`}>
                      <div className="text-center">
                        <Globe className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">{globalSettings.videoTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {globalSettings.aspectRatio} • {globalSettings.outputQuality}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Global Settings Summary</h3>
                      <div className="space-y-2 text-sm">
                        {/* Hidden: Video effects and audio settings - backend not implemented */}
                        <div className="hidden">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Brightness:</span>
                            <span>{globalSettings.brightness}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contrast:</span>
                            <span>{globalSettings.contrast}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saturation:</span>
                            <span>{globalSettings.saturation}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Music Volume:</span>
                            <span>{globalSettings.musicVolume}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Voice Volume:</span>
                            <span>{globalSettings.voiceVolume}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {globalSettings.watermark && (
                        <div className="p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Watermark</h4>
                          <p className="text-xs text-muted-foreground">{globalSettings.watermark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  selectedSection && (
                    <>
                      {/* Section Preview with Dynamic Aspect Ratio and Custom Layout */}
                      <div className={`rounded-lg overflow-hidden relative ${previewDimensions.className}`}
                           style={{
                             /* Hidden: Video effects filter - backend not implemented */
                             // filter: `brightness(${globalSettings.brightness}%) contrast(${globalSettings.contrast}%) saturate(${globalSettings.saturation}%)`,
                             backgroundColor: globalSettings.background === 'black' ? '#000000' : 
                                            globalSettings.background === 'white' ? '#ffffff' : 'transparent',
                             backgroundImage: globalSettings.background === 'custom' && globalSettings.customBackgroundImage ? 
                                            `url(${globalSettings.customBackgroundImage})` : 'none',
                             backgroundSize: 'cover',
                             backgroundPosition: 'center'
                           }}>
                        
                        {/* Watermark at top */}
                        {globalSettings.watermark && (
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 text-white/80 text-xs px-3 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                            {globalSettings.watermark}
                          </div>
                        )}

                        {selectedSection.image ? (
                          <>
                            {/* Portrait layout with 10% top and bottom margin for global background */}
                            {globalSettings.aspectRatio === '9:16' ? (
                              <div className="absolute inset-0 flex flex-col">
                                {/* Top 10% - Global background visible */}
                                <div className="flex-none h-[10%]"></div>
                                
                                {/* Middle 80% - Section image */}
                                <div className="flex-1 relative">
                                  <img
                                    src={selectedSection.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {/* Centered text overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg max-w-[80%]">
                                      <p className="text-white text-sm font-medium leading-relaxed">
                                        {selectedSection.text}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Bottom 10% - Global background visible */}
                                <div className="flex-none h-[10%]"></div>
                              </div>
                            ) : (
                              /* Non-portrait layouts - full image with centered text */
                              <>
                                <img
                                  src={selectedSection.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                
                                {/* Centered text overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg max-w-[80%]">
                                    <p className="text-white text-sm font-medium leading-relaxed">
                                      {selectedSection.text}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          /* No image - show placeholder with centered text */
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center" style={{ 
                              color: globalSettings.background === 'white' ? '#000000' : '#ffffff' 
                            }}>
                              <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                              <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <p className="text-sm font-medium mb-2">
                                  {selectedSection.text}
                                </p>
                                <p className="text-xs opacity-70">
                                  No image selected
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">{selectedSection.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {selectedSection.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentIndex = sections.findIndex(s => s.id === selectedSectionId);
                              if (currentIndex > 0) {
                                setSelectedSectionId(sections[currentIndex - 1].id);
                              }
                            }}
                            disabled={sections.findIndex(s => s.id === selectedSectionId) === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentIndex = sections.findIndex(s => s.id === selectedSectionId);
                              if (currentIndex < sections.length - 1) {
                                setSelectedSectionId(sections[currentIndex + 1].id);
                              }
                            }}
                            disabled={sections.findIndex(s => s.id === selectedSectionId) === sections.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Enhanced details with aspect ratio info */}
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Video Settings</h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>Aspect Ratio: {globalSettings.aspectRatio}</div>
                            <div>Quality: {globalSettings.outputQuality}</div>
                            {/* Hidden: Video effects - backend not implemented */}
                            {/* <div>Effects: {globalSettings.brightness}% brightness, {globalSettings.contrast}% contrast</div> */}
                          </div>
                        </div>

                        {selectedSection.voiceSettings && (
                          <div className="p-3 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Voice Settings</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div>Speed: {selectedSection.voiceSettings.speed}x</div>
                              <div>Gender: {selectedSection.voiceSettings.gender}</div>
                              <div>Accent: {selectedSection.voiceSettings.accent}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}