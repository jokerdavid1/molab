type Props = {
  params: Promise<{ jobId: string }>;
};

export async function POST(req: Request, { params }: Props) {
  try {
    const { jobId } = await params;
    const analysisServerUrl = process.env.ANALYSIS_SERVER_URL;

    if (!analysisServerUrl) {
      return Response.json(
        { error: "ANALYSIS_SERVER_URL is not set." },
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const response = await fetch(`${analysisServerUrl}/analyze/upload/${jobId}`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to upload file batch.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
