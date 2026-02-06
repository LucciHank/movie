import supabase from "../supabase.js";
import responseHandler from "../handlers/response.handler.js";
import torrentService from "../services/torrent.service.js";

const isAdmin = (user) => user && (user.username === "hoanganhdo181@gmail.com" || user.username === "admin2004" || user.role === "admin");

const getSourcesByMedia = async (req, res) => {
  try {
    const { mediaType, mediaId } = req.params;
    const { region, title, year, imdbId, season, episode } = req.query;

    // Get sources from Supabase
    const { data: dbSources, error: dbError } = await supabase
      .from('watch_sources')
      .select('*')
      .eq('media_id', String(mediaId))
      .eq('media_type', mediaType)
      .eq('status', 'active');

    if (dbError) {
      console.error("Supabase error fetching sources:", dbError);
    }

    // Filter by region if provided
    let filteredDbSources = dbSources || [];
    if (region) {
      filteredDbSources = filteredDbSources.filter(s =>
        !s.region_allowlist || s.region_allowlist.length === 0 || s.region_allowlist.includes(region)
      );
    }

    // Get streaming and torrent sources from external services
    const watchSources = await torrentService.getTorrentSources({
      mediaType,
      mediaId,
      imdbId,
      title,
      year: year ? parseInt(year) : undefined,
      season: season ? parseInt(season) : 1,
      episode: episode ? parseInt(episode) : 1
    });

    // Combine all sources
    const allSources = {
      dbSources: filteredDbSources.map(s => ({
        id: s.id,
        provider: s.provider,
        title: s.title,
        quality: s.quality,
        url: s.url,
        playbackType: s.playback_type,
        language: s.language,
        sourceType: "stream"
      })),
      embedSources: watchSources.embedSources || [],
      torrentSources: watchSources.torrentSources || []
    };

    responseHandler.ok(res, allSources);
  } catch (e) {
    console.log("getSourcesByMedia error:", e.message);
    responseHandler.error(res);
  }
};

const createSource = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return responseHandler.unauthorize(res);

    const { data: source, error } = await supabase
      .from('watch_sources')
      .insert({
        ...req.body,
        media_id: String(req.body.mediaId),
        media_type: req.body.mediaType,
        playback_type: req.body.playbackType,
        region_allowlist: req.body.regionAllowlist,
        created_by: req.user.username
      })
      .select()
      .single();

    if (error) throw error;

    responseHandler.created(res, source);
  } catch (err) {
    console.error("Create source error:", err);
    responseHandler.error(res);
  }
};

const updateSource = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return responseHandler.unauthorize(res);

    const { sourceId } = req.params;

    const updateData = {};
    const updatableFields = [
      "title",
      "provider",
      "playbackType",
      "url",
      "quality",
      "language",
      "licenseType",
      "licenseProofUrl",
      "regionAllowlist",
      "status"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "playbackType") updateData.playback_type = req.body[field];
        else if (field === "regionAllowlist") updateData.region_allowlist = req.body[field];
        else updateData[field] = req.body[field];
      }
    });

    const { data: source, error } = await supabase
      .from('watch_sources')
      .update(updateData)
      .eq('id', sourceId)
      .select()
      .single();

    if (error || !source) return responseHandler.notfound(res);

    responseHandler.ok(res, source);
  } catch {
    responseHandler.error(res);
  }
};

const createReport = async (req, res) => {
  try {
    const { sourceId } = req.params;

    const { data: source } = await supabase
      .from('watch_sources')
      .select('id, status')
      .eq('id', sourceId)
      .single();

    if (!source) return responseHandler.notfound(res);

    const { data: report, error } = await supabase
      .from('watch_source_reports')
      .insert({
        source_id: source.id,
        reason: req.body.reason,
        email: req.body.email
      })
      .select()
      .single();

    if (error) throw error;

    if (source.status === "active") {
      await supabase
        .from('watch_sources')
        .update({ status: 'flagged' })
        .eq('id', source.id);
    }

    responseHandler.created(res, report);
  } catch {
    responseHandler.error(res);
  }
};

const getReports = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return responseHandler.unauthorize(res);

    const { data: reports, error } = await supabase
      .from('watch_source_reports')
      .select(`
        *,
        watch_sources:source_id (*)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    responseHandler.ok(res, reports);
  } catch {
    responseHandler.error(res);
  }
};

export default {
  getSourcesByMedia,
  createSource,
  updateSource,
  createReport,
  getReports
};
