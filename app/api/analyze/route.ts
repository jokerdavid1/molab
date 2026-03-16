export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const response = await fetch(
      `${process.env.ANALYSIS_SERVER_URL}/analyze`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    return Response.json(data, { status: response.status });

  } catch (error) {
    return Response.json(
      { error: "Analysis server connection failed" },
      { status: 500 }
    );
  }
}
