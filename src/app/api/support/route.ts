// src/app/api/support/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

// Validation schema
const ticketSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  platform: z.enum(["WEB", "IOS"], {
    errorMap: () => ({ message: "Please select a valid platform" })
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ticketSchema.parse(body);

    const ticket = await db.supportTicket.create({
      data: {
        email: validatedData.email,
        subject: validatedData.subject,
        description: validatedData.description,
        platform: validatedData.platform,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        email: ticket.email,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const tickets = await db.supportTicket.findMany({
      where: {
        email,
        ...(status && { status: status as any }),
        ...(platform && { platform: platform as any }),
      },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        responses: ticket.responses.map((response) => ({
          ...response,
          createdAt: response.createdAt.toISOString(),
          updatedAt: response.updatedAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}