"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Video, Sparkles, Upload, Settings, Play } from "lucide-react";

export default function Home() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = () => {
    setIsCreating(true);
    // In a real app, this would navigate to the script input page
    setTimeout(() => {
      window.location.href = '/create';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ShortsCreator</h1>
                <p className="text-sm text-muted-foreground">AI-powered YouTube Shorts generator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-4xl font-bold text-foreground">Create Viral YouTube Shorts</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Just enter a topic—our AI handles scriptwriting, voiceovers, visuals, and video editing.
              Go from idea to finished video in minutes.
            </p>
            
            <Button 
              onClick={handleCreateNew}
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create New Short
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Script Generation</CardTitle>
                <CardDescription>
                  Enter any topic and our AI creates engaging, viral-ready scripts tailored for YouTube Shorts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Segmentation</CardTitle>
                <CardDescription>
                  Automatically break scripts into scenes with custom voiceovers and image uploads for each segment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Instant Video Render</CardTitle>
                <CardDescription>
                  Combine audio, visuals, and effects into polished YouTube Shorts ready for upload.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Workflow Steps */}
          <div className="bg-card/50 border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold text-foreground mb-2">Enter Topic</h4>
                <p className="text-sm text-muted-foreground">Provide a topic or paste your script</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold text-foreground mb-2">Edit Segments</h4>
                <p className="text-sm text-muted-foreground">Split script, add voice settings & images</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold text-foreground mb-2">Customize</h4>
                <p className="text-sm text-muted-foreground">Adjust effects, audio, and video settings</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold text-foreground mb-2">Export</h4>
                <p className="text-sm text-muted-foreground">Download your ready-to-upload Short</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
