
import { Request, Response } from "express";
import { ProgramCategory } from "@prisma/client";

import * as programService from "../services/programs.service";
import type { ListQuery } from "../services/programs.service";


function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function getId(req: Request): string {
  const id = req.params.id;

  return Array.isArray(id) ? id[0] : id;
}

function parseListQuery(req: Request): ListQuery {
  const q = req.query;

  return {
    page: q.page ? Number(q.page) : undefined,

    pageSize: q.pageSize
      ? Number(q.pageSize)
      : undefined,

    search:
      typeof q.search === "string"
        ? q.search
        : undefined,

    category:
      typeof q.category === "string" && q.category
        ? (q.category as ProgramCategory)
        : undefined,

    sector:
      typeof q.sector === "string"
        ? q.sector
        : undefined,

    region:
      typeof q.region === "string"
        ? q.region
        : undefined,

    isPublished:
      q.isPublished === "true"
        ? true
        : q.isPublished === "false"
          ? false
          : undefined,

    isArchived:
      q.isArchived === "true"
        ? true
        : q.isArchived === "false"
          ? false
          : undefined,

    sort:
      (q.sort as ListQuery["sort"]) ?? "newest",
  };
}

function handleError(
  res: Response,
  err: unknown
) {
  const anyErr = err as {
    statusCode?: number;
    message?: string;
  };

  const status =
    anyErr.statusCode ?? 500;

  return res.status(status).json({
    success: false,
    message:
      anyErr.message ??
      "Internal server error",
  });
}



export async function listInstitutionPrograms(
  req: Request,
  res: Response
) {
  try {
    const result =
      await programService.listInstitutionPrograms(
        req.user!.id,
        parseListQuery(req)
      );

    return res.json({
      success: true,
      ...serializeBigInt(result),
    });
  } catch (err) {
    console.error(
      "LIST INSTITUTION PROGRAMS ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function getInstitutionStats(
  req: Request,
  res: Response
) {
  try {
    const stats =
      await programService.getInstitutionStats(
        req.user!.id
      );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getInstitutionProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.getInstitutionProgramById(
        req.user!.id,
        getId(req)
      );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    console.error(
      "GET INSTITUTION PROGRAM ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function createProgram(
  req: Request,
  res: Response
) {
  try {
    console.log("USER:", req.user);
    console.log("BODY:", req.body);

    const program =
      await programService.createProgram(
        req.user!.id,
        req.body
      );

    return res.status(201).json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    console.error(
      "CREATE PROGRAM ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function updateProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.updateOwnProgram(
        req.user!.id,
        getId(req),
        req.body
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    console.error(
      "UPDATE PROGRAM ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function deleteProgram(
  req: Request,
  res: Response
) {
  try {
    await programService.deleteOwnProgram(
      req.user!.id,
      getId(req)
    );

    return res.json({
      success: true,
      message: "Program deleted",
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function publishProgram(
  req: Request,
  res: Response
) {
  try {
    const isPublished =
      Boolean(
        req.body?.isPublished ?? true
      );

    const program =
      await programService.setPublishStatus(
        req.user!.id,
        getId(req),
        isPublished
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function archiveProgram(
  req: Request,
  res: Response
) {
  try {
    const isArchived =
      Boolean(
        req.body?.isArchived ?? true
      );

    const program =
      await programService.setArchiveStatus(
        req.user!.id,
        getId(req),
        isArchived
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getInstitutionProgramApplications(
  req: Request,
  res: Response
) {
  try {
    const applications =
      await programService.getOwnProgramApplications(
        req.user!.id,
        getId(req)
      );

    return res.json({
      success: true,
      data: serializeBigInt(applications),
    });
  } catch (err) {
    return handleError(res, err);
  }
}



export async function listPrograms(
  req: Request,
  res: Response
) {
  try {
    const result =
      await programService.listPublicPrograms(
        parseListQuery(req)
      );

    return res.json({
      success: true,
      ...serializeBigInt(result),
    });
  } catch (err) {
    console.error(
      "LIST PUBLIC PROGRAMS ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function getProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.getPublicProgramById(
        getId(req)
      );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    console.error(
      "GET PUBLIC PROGRAM ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function applyToProgram(
  req: Request,
  res: Response
) {
  try {
    const amountRequested =
      req.body.amountRequested !== undefined
        ? BigInt(req.body.amountRequested)
        : BigInt(0);

    const application =
      await programService.applyToProgram(
        req.user!.id,
        getId(req),
        amountRequested
      );

    return res.status(201).json({
      success: true,
      data: serializeBigInt(application),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function favoriteProgram(
  req: Request,
  res: Response
) {
  try {
    const favorite =
      await programService.addFavorite(
        req.user!.id,
        getId(req)
      );

    return res.status(201).json({
      success: true,
      data: serializeBigInt(favorite),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function unfavoriteProgram(
  req: Request,
  res: Response
) {
  try {
    await programService.removeFavorite(
      req.user!.id,
      getId(req)
    );

    return res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function listMyApplications(
  req: Request,
  res: Response
) {
  try {
    const applications =
      await programService.listMyApplications(
        req.user!.id
      );

    return res.json({
      success: true,
      data: serializeBigInt(applications),
    });
  } catch (err) {
    return handleError(res, err);
  }
}


export async function listExpertPrograms(
  req: Request,
  res: Response
) {
  try {
    const result =
      await programService.listExpertPrograms(
        parseListQuery(req)
      );

    return res.json({
      success: true,
      ...serializeBigInt(result),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getExpertProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.getExpertProgramById(
        getId(req)
      );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}


export async function listAllPrograms(
  req: Request,
  res: Response
) {
  try {
    const result =
      await programService.listAllPrograms(
        parseListQuery(req)
      );

    console.log(
      "ADMIN PROGRAMS:",
      result.items.length,
      "of",
      result.pagination.total
    );

    return res.json({
      success: true,
      ...serializeBigInt(result),
    });
  } catch (err) {
    console.error(
      "LIST ADMIN PROGRAMS ERROR:",
      err
    );

    return handleError(res, err);
  }
}

export async function getAnyProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.getAnyProgramById(
        getId(req)
      );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function adminUpdateProgram(
  req: Request,
  res: Response
) {
  try {
    const program =
      await programService.adminUpdateProgram(
        getId(req),
        req.body
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function adminDeleteProgram(
  req: Request,
  res: Response
) {
  try {
    await programService.adminDeleteProgram(
      getId(req)
    );

    return res.json({
      success: true,
      message: "Program deleted",
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function adminPublishProgram(
  req: Request,
  res: Response
) {
  try {
    const isPublished =
      Boolean(
        req.body?.isPublished ?? true
      );

    const program =
      await programService.adminSetPublishStatus(
        getId(req),
        isPublished
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function adminArchiveProgram(
  req: Request,
  res: Response
) {
  try {
    const isArchived =
      Boolean(
        req.body?.isArchived ?? true
      );

    const program =
      await programService.adminSetArchiveStatus(
        getId(req),
        isArchived
      );

    return res.json({
      success: true,
      data: serializeBigInt(program),
    });
  } catch (err) {
    return handleError(res, err);
  }
}
