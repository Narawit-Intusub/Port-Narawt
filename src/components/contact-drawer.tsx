"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import {
  Field,
  FieldLabel,
  FieldGroup
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDrawer({ open, onOpenChange }: ContactDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const senderName = String(formData.get("name") || "there").trim();

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      form.reset();
      toast.success("Message request captured", {
        description: `Thanks ${senderName}. Connect this form to an email/API endpoint when ready.`,
      });
    }, 800);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md mx-auto">
        <form onSubmit={handleContactSubmit}>
          <DrawerHeader>
            <DrawerTitle className="text-lg font-serif">ส่งข้อความถึง Narawit</DrawerTitle>
            <DrawerDescription className="text-xs">
              กรอกข้อมูลด้านล่างเพื่อติดต่อสอบถามความสนใจหรือความร่วมมือในโครงการต่างๆ
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">ชื่อ / Name</FieldLabel>
                <Input id="name" name="name" required placeholder="ชื่อของคุณ" className="h-8" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">อีเมล / Email</FieldLabel>
                <Input id="email" name="email" required type="email" placeholder="example@email.com" className="h-8" />
              </Field>
              <Field>
                <FieldLabel htmlFor="message">รายละเอียด / Message</FieldLabel>
                <Textarea id="message" name="message" required placeholder="เขียนรายละเอียดงานหรือข้อเสนอ..." rows={4} className="min-h-[100px] resize-none" />
              </Field>
            </FieldGroup>
          </div>

          <DrawerFooter className="flex flex-row gap-2 border-t border-border mt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200">
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? "กำลังส่ง..." : "ส่งข้อความ"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 h-9">ยกเลิก</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
