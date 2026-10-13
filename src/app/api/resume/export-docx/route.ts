import { NextResponse } from 'next/server';
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { StructuredResumeData } from '@/types/resume';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { structuredResume, targetRole } = body as {
      structuredResume: StructuredResumeData;
      targetRole?: string;
    };

    if (!structuredResume) {
      return NextResponse.json({ error: 'Missing structured resume data' }, { status: 400 });
    }

    const { contact, summary, experience = [], education = [], skills, certifications = [] } = structuredResume;

    const children: Paragraph[] = [];

    // 1. Candidate Name (Large, Bold, Clean)
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: contact?.name || 'Product Manager',
            bold: true,
            size: 32, // 16pt
            font: 'Arial',
            color: '202020',
          }),
        ],
      })
    );

    // 2. Candidate Subtitle (if targetRole provided)
    if (targetRole) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: targetRole.toUpperCase(),
              bold: true,
              size: 20, // 10pt
              font: 'Arial',
              color: '555555',
            }),
          ],
        })
      );
    }

    // 3. Contact Details Line
    const contactParts: string[] = [];
    if (contact?.email) contactParts.push(contact.email);
    if (contact?.phone) contactParts.push(contact.phone);
    if (contact?.location) contactParts.push(contact.location);
    if (contact?.linkedin) contactParts.push(contact.linkedin.replace(/^https?:\/\//, ''));
    if (contact?.portfolio) contactParts.push(contact.portfolio.replace(/^https?:\/\//, ''));

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: contactParts.join('  |  '),
              size: 19, // 9.5pt
              font: 'Arial',
              color: '444444',
            }),
          ],
        })
      );
    }

    // Helper for Section Headings
    const createSectionHeader = (title: string) => {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        border: {
          bottom: {
            color: '202020',
            space: 4,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: 'Arial',
            color: '202020',
          }),
        ],
      });
    };

    // 4. Professional Summary
    if (summary && summary.trim().length > 0) {
      children.push(createSectionHeader('Professional Summary'));
      children.push(
        new Paragraph({
          spacing: { after: 160, line: 260 },
          children: [
            new TextRun({
              text: summary.trim(),
              size: 20,
              font: 'Arial',
              color: '333333',
            }),
          ],
        })
      );
    }

    // 5. Work Experience
    if (experience.length > 0) {
      children.push(createSectionHeader('Work Experience'));

      for (const item of experience) {
        // Job Title & Company Line
        const dateRange = [item.startDate, item.endDate || 'Present'].filter(Boolean).join(' - ');

        children.push(
          new Paragraph({
            spacing: { before: 140, after: 40 },
            children: [
              new TextRun({
                text: item.role || 'Product Manager',
                bold: true,
                size: 21,
                font: 'Arial',
                color: '202020',
              }),
              new TextRun({
                text: item.company ? `  —  ${item.company}` : '',
                bold: true,
                size: 20,
                font: 'Arial',
                color: '333333',
              }),
              new TextRun({
                text: dateRange ? `  (${dateRange})` : '',
                italics: true,
                size: 19,
                font: 'Arial',
                color: '666666',
              }),
            ],
          })
        );

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          for (const bullet of item.bullets) {
            const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '').trim();
            if (!cleanBullet) continue;

            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60, line: 240 },
                children: [
                  new TextRun({
                    text: cleanBullet,
                    size: 20,
                    font: 'Arial',
                    color: '333333',
                  }),
                ],
              })
            );
          }
        }
      }
    }

    // 6. Skills & Competencies
    if (skills) {
      const hasSkills =
        (skills.productSkills && skills.productSkills.length > 0) ||
        (skills.technicalSkills && skills.technicalSkills.length > 0) ||
        (skills.tools && skills.tools.length > 0);

      if (hasSkills) {
        children.push(createSectionHeader('Skills & Competencies'));

        if (skills.productSkills && skills.productSkills.length > 0) {
          children.push(
            new Paragraph({
              spacing: { after: 60, line: 240 },
              children: [
                new TextRun({ text: 'Product Competencies: ', bold: true, size: 20, font: 'Arial', color: '202020' }),
                new TextRun({ text: skills.productSkills.join(', '), size: 20, font: 'Arial', color: '333333' }),
              ],
            })
          );
        }

        if (skills.technicalSkills && skills.technicalSkills.length > 0) {
          children.push(
            new Paragraph({
              spacing: { after: 60, line: 240 },
              children: [
                new TextRun({ text: 'Technical Skills: ', bold: true, size: 20, font: 'Arial', color: '202020' }),
                new TextRun({ text: skills.technicalSkills.join(', '), size: 20, font: 'Arial', color: '333333' }),
              ],
            })
          );
        }

        if (skills.tools && skills.tools.length > 0) {
          children.push(
            new Paragraph({
              spacing: { after: 80, line: 240 },
              children: [
                new TextRun({ text: 'Tools & Platforms: ', bold: true, size: 20, font: 'Arial', color: '202020' }),
                new TextRun({ text: skills.tools.join(', '), size: 20, font: 'Arial', color: '333333' }),
              ],
            })
          );
        }
      }
    }

    // 7. Education
    if (education.length > 0) {
      children.push(createSectionHeader('Education'));

      for (const edu of education) {
        const eduDesc = [edu.degree, edu.field, edu.institution].filter(Boolean).join(', ');
        children.push(
          new Paragraph({
            spacing: { after: 60, line: 240 },
            children: [
              new TextRun({ text: eduDesc, bold: true, size: 20, font: 'Arial', color: '202020' }),
              new TextRun({
                text: edu.graduationYear ? ` (${edu.graduationYear})` : '',
                italics: true,
                size: 19,
                font: 'Arial',
                color: '666666',
              }),
            ],
          })
        );
      }
    }

    // 8. Certifications
    if (certifications && certifications.length > 0) {
      children.push(createSectionHeader('Certifications'));
      for (const cert of certifications) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40, line: 220 },
            children: [
              new TextRun({ text: cert, size: 20, font: 'Arial', color: '333333' }),
            ],
          })
        );
      }
    }

    // Build Word Document with standard 0.75-inch margins
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1080, // 0.75 in
                right: 1080,
                bottom: 1080,
                left: 1080,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const candidateName = contact?.name ? contact.name.replace(/[^a-zA-Z0-9]/g, '_') : 'PM_Candidate';
    const filename = `${candidateName}_ATS_Optimized_Resume.docx`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Error exporting DOCX resume:', err);
    return NextResponse.json({ error: err?.message || 'Failed to export DOCX document' }, { status: 500 });
  }
}
