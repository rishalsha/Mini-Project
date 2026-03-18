package com.portfolio.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
public class DocumentParserService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();

            // If it's a PDF, use PDFBox for pure text extraction (ignores images)
            if (file.getContentType() != null && file.getContentType().contains("pdf")) {
                String pdfText = extractPDFText(new ByteArrayInputStream(fileBytes));
                if (pdfText != null && !pdfText.trim().isEmpty()) {
                    return pdfText;
                }

                // Fallback to Tika when PDF text is empty (common for some encoded/scanned docs)
                String tikaText = tika.parseToString(new ByteArrayInputStream(fileBytes));
                System.out.println("PDFBox returned empty text; fallback to Tika extracted " + tikaText.length()
                        + " characters from file: " + file.getOriginalFilename());
                if (tikaText == null || tikaText.trim().isEmpty()) {
                    throw new RuntimeException("No readable text found in PDF document");
                }
                return tikaText;
            }

            // For other formats, use Tika
            try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
                String text = tika.parseToString(inputStream);
                System.out
                        .println("Extracted " + text.length() + " characters from file: " + file.getOriginalFilename());
                if (text == null || text.trim().isEmpty()) {
                    throw new RuntimeException("No readable text found in document");
                }
                return text;
            }
        } catch (Exception e) {
            System.err.println("Error extracting text from file: " + e.getMessage());
            throw new RuntimeException("Failed to extract text from document", e);
        }
    }

    private String extractPDFText(InputStream inputStream) throws Exception {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            System.out.println("Extracted " + text.length() + " characters from PDF using PDFBox");
            return text;
        }
    }

    public String extractTextFromBytes(byte[] fileBytes, String mimeType) {
        try {
            // If it's a PDF, use PDFBox for pure text extraction
            if (mimeType != null && mimeType.contains("pdf")) {
                String pdfText = extractPDFText(new ByteArrayInputStream(fileBytes));
                if (pdfText != null && !pdfText.trim().isEmpty()) {
                    return pdfText;
                }

                String tikaText = tika.parseToString(new ByteArrayInputStream(fileBytes));
                if (tikaText == null || tikaText.trim().isEmpty()) {
                    throw new RuntimeException("No readable text found in PDF document");
                }
                return tikaText;
            }

            String text = tika.parseToString(new ByteArrayInputStream(fileBytes));
            System.out.println("Extracted " + text.length() + " characters from byte array");
            if (text == null || text.trim().isEmpty()) {
                throw new RuntimeException("No readable text found in document bytes");
            }
            return text;
        } catch (Exception e) {
            System.err.println("Error extracting text from bytes: " + e.getMessage());
            throw new RuntimeException("Failed to extract text from document", e);
        }
    }
}
