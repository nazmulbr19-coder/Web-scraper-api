router.get('/watch/:episodeId', async (req, res) => {
  try {
    const data = await gogoExtractor.extractStream(req.params.episodeId);
    if (!data.success) {
      return res.status(404).json(data);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

