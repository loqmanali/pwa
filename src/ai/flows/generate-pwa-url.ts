'use server';
/**
 * @fileOverview A PWA URL generation AI agent.
 *
 * - generatePwaUrl - A function that generates a custom PWA URL.
 * - GeneratePwaUrlInput - The input type for the generatePwaUrl function.
 * - GeneratePwaUrlOutput - The return type for the generatePwaUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

const GeneratePwaUrlInputSchema = z.object({
  url: z.string().describe('The URL to generate a PWA for.'),
});
export type GeneratePwaUrlInput = z.infer<typeof GeneratePwaUrlInputSchema>;

const GeneratePwaUrlOutputSchema = z.object({
  pwaUrl: z.string().describe('The generated PWA URL.'),
});
export type GeneratePwaUrlOutput = z.infer<typeof GeneratePwaUrlOutputSchema>;

export async function generatePwaUrl(input: GeneratePwaUrlInput): Promise<GeneratePwaUrlOutput> {
  return generatePwaUrlFlow(input);
}

const generatePwaUrlPrompt = ai.definePrompt({
  name: 'generatePwaUrlPrompt',
  input: {
    schema: z.object({
      url: z.string().describe('The URL to generate a PWA for.'),
      uniqueId: z.string().describe('The unique ID of the PWA configuration.'),
    }),
  },
  output: {
    schema: z.object({
      pwaUrl: z.string().describe('The generated PWA URL.'),
    }),
  },
  prompt: `You are an AI that generates custom PWA URLs. Given a URL and a unique ID, you will generate a unique PWA configuration and return a URL pointing to that configuration.

URL: {{{url}}}
Unique ID: {{{uniqueId}}}

Generate a unique PWA URL based on the input URL and unique ID.`,
});

async function savePWAConfig(uniqueId: string, pwaConfig: any) {
  const filePath = path.join(process.cwd(), 'pwa-configs', `${uniqueId}.json`);
  await fs.writeFile(filePath, JSON.stringify(pwaConfig));
  return filePath;
}

const generatePwaUrlFlow = ai.defineFlow<
  typeof GeneratePwaUrlInputSchema,
  typeof GeneratePwaUrlOutputSchema
>(
  {
    name: 'generatePwaUrlFlow',
    inputSchema: GeneratePwaUrlInputSchema,
    outputSchema: GeneratePwaUrlOutputSchema,
  },
  async input => {
    // Generate a unique ID for the PWA configuration.
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const pwaConfig = {
      originalUrl: input.url,
      // Add any other PWA configurations here.
    };

    // Store the PWA configuration in the file system.
    try {
      const filePath = await savePWAConfig(uniqueId, pwaConfig);
      console.log("PWA configuration written to: ", filePath);
    } catch (e: any) {
      console.error("Error adding document: ", e);
      throw new Error("Failed to store PWA configuration.");
    }

    // Return a URL pointing to the PWA configuration.
    const pwaUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/${uniqueId}`;

    const {output} = await generatePwaUrlPrompt({...input, uniqueId: uniqueId});
    return {pwaUrl: pwaUrl};
  }
);
