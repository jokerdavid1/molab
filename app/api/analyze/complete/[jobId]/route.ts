type Props = {
  params: Promise<{ jobId: string }>;
};

export async function POST(_: Request, { params }: Props) {
  try {
    const { jobId } = await params;
    const analysisServerUrl = process.env.ANALYSIS_SERVER_URL;

    if (!analysisServerUrl) {
      return Response.json(
        { error: "ANALYSIS_SERVER_URL is not set." },
        { status: 500 }
      );
    }

    const response = await fetch(`${analysisServerUrl}/analyze/complete/${jobId}`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data?.zip_url && data.zip_url.startsWith("/")) {
      data.zip_url = `${analysisServerUrl}${data.zip_url}`;
    }

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to complete analysis.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
