'use server';
/**
 * @fileOverview A URL validation AI agent.
 *
 * - validateUrl - A function that validates a URL using AI.
 * - ValidateUrlInput - The input type for the validateUrl function.
 * - ValidateUrlOutput - The return type for the validateUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ValidateUrlInputSchema = z.object({
  url: z.string().describe('The URL to validate.'),
});
export type ValidateUrlInput = z.infer<typeof ValidateUrlInputSchema>;

const ValidateUrlOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the URL is valid and active.'),
  reason: z.string().optional().describe('The reason the URL is invalid, if applicable.'),
});
export type ValidateUrlOutput = z.infer<typeof ValidateUrlOutputSchema>;

export async function validateUrl(input: ValidateUrlInput): Promise<ValidateUrlOutput> {
  return validateUrlFlow(input);
}

const validateUrlPrompt = ai.definePrompt({
  name: 'validateUrlPrompt',
  input: {
    schema: z.object({
      url: z.string().describe('The URL to validate.'),
    }),
  },
  output: {
    schema: z.object({
      isValid: z.boolean().describe('Whether the URL is valid and active.'),
      reason: z.string().optional().describe('The reason the URL is invalid, if applicable.'),
    }),
  },
  prompt: `You are an AI that validates URLs.  Given the URL, determine if it is a valid and active website.

URL: {{{url}}}

Respond with a boolean value for 'isValid'. If the URL is not valid, provide a brief 'reason'.`,
});

const validateUrlFlow = ai.defineFlow<
  typeof ValidateUrlInputSchema,
  typeof ValidateUrlOutputSchema
>(
  {
    name: 'validateUrlFlow',
    inputSchema: ValidateUrlInputSchema,
    outputSchema: ValidateUrlOutputSchema,
  },
  async input => {
    const {output} = await validateUrlPrompt(input);
    return output!;
  }
);
