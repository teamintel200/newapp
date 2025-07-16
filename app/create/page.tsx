"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileText, Sparkles } from "lucide-react";
import { useVideoStore } from "@/lib/store";
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setSections, reset } = useVideoStore();

  const handleSubmit = async () => {
    if (!script.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate project ID by calling temp-directory API
      const tempDirResponse = await fetch('/api/temp-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!tempDirResponse.ok) {
        throw new Error('Failed to create project directory');
      }

      const { tempDirName: projectId } = await tempDirResponse.json();

      // Split script by line breaks and create sections
      const lines = script.trim().split('\n').filter(line => line.trim().length > 0);
      const sections = lines.map((line, index) => ({
        id: (index + 1).toString(),
        title: `Section ${index + 1}`,
        text: line.trim()
      }));
      
      // Reset store and set new sections
      reset();
      setSections(sections);
      
      // Store project ID and original script in localStorage for API calls
      localStorage.setItem('originalScript', script.trim());
      localStorage.setItem('projectId', projectId);
      
      setTimeout(() => {
        router.push('/segments');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const wordCount = script.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = script.length;
  const isScriptValid = script.trim().length >= 50;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Script Input</h1>
                  <p className="text-sm text-muted-foreground">Step 1 of 3</p>
                </div>
              </div>
            </div>
            
            {/* Progress Indicators */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">1</span>
                </div>
                <span className="text-sm text-foreground font-medium">Script</span>
              </div>
              <div className="w-8 h-px bg-muted"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">2</span>
                </div>
                <span className="text-sm text-muted-foreground">Scenes</span>
              </div>
              <div className="w-8 h-px bg-muted"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Generate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Intro Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Enter Your Script</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Paste or type your video script below. We'll automatically break it down into scenes
              and help you create engaging visuals for each section.
            </p>
          </div>

          {/* Script Input Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5" />
                Video Script
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your complete script. Minimum 50 characters required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your video script here...

For example:
Welcome to our product demo! Today I'll show you how our revolutionary new app can transform your daily workflow. 

First, let's look at the main dashboard where you can see all your projects at a glance. The clean interface makes it easy to navigate between different tasks.

Next, I'll demonstrate how to create a new project. With just a few clicks, you can set up everything you need to get started..."
                  className="min-h-[300px] resize-none text-base leading-relaxed bg-background border-border focus:border-primary focus:ring-primary"
                />
                
                {/* Character/Word Count */}
                <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  {wordCount} words · {charCount} characters
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">💡 Script Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Write in a conversational, natural tone</li>
                  <li>• Break complex ideas into shorter sentences</li>
                  <li>• Include clear transitions between topics</li>
                  <li>• Consider where visual elements would enhance your message</li>
                </ul>
              </div>

              {/* Validation Message */}
              {script.length > 0 && !isScriptValid && (
                <div className="text-sm text-muted-foreground">
                  Script must be at least 50 characters long ({50 - script.trim().length} more needed)
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!isScriptValid || isLoading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Scenes
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}