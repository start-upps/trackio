// src/components/support/SupportForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FormData {
  email: string;
  subject: string;
  description: string;
  platform: "WEB" | "IOS";
}

interface SuccessData {
  id: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

const INITIAL_FORM_DATA: FormData = {
  email: "",
  subject: "",
  description: "",
  platform: "WEB",
};

const LIMITS = {
  subject: 100,
  description: 1000,
};

export function SupportForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setSuccessData(data.ticket);
      setShowSuccess(true);
      setFormData(INITIAL_FORM_DATA);
      
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast.error("Failed to submit support ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTicketId = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.id);
      toast.success("Ticket ID copied to clipboard");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Platform
            <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="platform"
                value="WEB"
                checked={formData.platform === "WEB"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    platform: e.target.value as "WEB" | "IOS",
                  }))
                }
                className="mr-2"
              />
              Website
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="platform"
                value="IOS"
                checked={formData.platform === "IOS"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    platform: e.target.value as "WEB" | "IOS",
                  }))
                }
                className="mr-2"
              />
              iOS App
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            disabled={isLoading}
            className={cn(
              "w-full p-2 bg-gray-800 rounded-md",
              "border border-gray-700",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-colors",
              isLoading && "opacity-50"
            )}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Subject
            <span className="text-red-500">*</span>
            <span className="text-gray-400 text-xs ml-2">
              ({formData.subject.length}/{LIMITS.subject})
            </span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            maxLength={LIMITS.subject}
            required
            disabled={isLoading}
            className={cn(
              "w-full p-2 bg-gray-800 rounded-md",
              "border border-gray-700",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-colors",
              isLoading && "opacity-50"
            )}
            placeholder="Brief description of your issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
            <span className="text-red-500">*</span>
            <span className="text-gray-400 text-xs ml-2">
              ({formData.description.length}/{LIMITS.description})
            </span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            maxLength={LIMITS.description}
            required
            disabled={isLoading}
            className={cn(
              "w-full p-2 bg-gray-800 rounded-md",
              "border border-gray-700",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-colors resize-y min-h-[150px]",
              isLoading && "opacity-50"
            )}
            placeholder="Please provide as much detail as possible about your issue"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full",
            "bg-blue-500 hover:bg-blue-600",
            "transition-colors"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Support Ticket"
          )}
        </Button>
      </form>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Support Ticket Submitted
            </DialogTitle>
            <DialogDescription>
              We've received your support request and will respond via email shortly.
            </DialogDescription>
          </DialogHeader>

          {successData && (
            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Ticket ID</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-400 hover:text-blue-300"
                    onClick={copyTicketId}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="font-mono text-sm">{successData.id}</div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-400">Subject</div>
                  <div>{successData.subject}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div>{successData.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="capitalize">{successData.status.toLowerCase()}</div>
                </div>
              </div>

              <div className="pt-4 text-sm text-gray-400">
                <p>
                  We'll send updates about your ticket to your email address. 
                  Please keep your ticket ID for future reference.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}