import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../config/database";
import { env } from "../config/env";
import { Role } from "../types";



// CREATE
export const createApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      password,
      title,
      experience,
      specialties,
      languages,
      linkedin,
      portfolio,
      certifications,
      motivation,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nom, email et mot de passe sont obligatoires.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      env.BCRYPT_ROUNDS
    );

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name: fullName.trim(),
          role: Role.EXPERT,
          isActive: false,
          isVerified: false,
        },
      });

      const application = await tx.expertApplication.create({
        data: {
          fullName,
          email: email.toLowerCase().trim(),
          title,
          experience,
          specialties,
          languages,
          linkedin,
          portfolio,
          certifications,
          motivation,
          cvPath: req.file?.path ?? null,
        },
      });

      return { user, application };
    });

    res.status(201).json({
      success: true,
      application: result.application,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Create failed",
    });
  }
};

// GET ALL
export const getApplications = async(
req:Request,
res:Response
)=>{

try{


const applications =
await prisma.expertApplication.findMany({
orderBy:{
createdAt:"desc"
}
});


res.json({
success:true,
applications
});


}catch(error){

console.error(error);

res.status(500).json({
message:"Get failed"
});

}


};



// GET ONE
export const getApplication = async(
req:Request,
res:Response
)=>{


try{


const application =
await prisma.expertApplication.findUnique({
where:{
id:String(req.params.id)
}
});


if(!application){

return res.status(404).json({
message:"Not found"
});

}


res.json({
success:true,
application
});


}catch(error){

res.status(500).json({
message:"Error"
});

}


};



// APPROVE
export const approveApplication = async (
  req: Request,
  res: Response
) => {
  try {

    const application = await prisma.expertApplication.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: "APPROVED",
      },
    });

    await prisma.user.update({
      where: {
        email: application.email,
      },
      data: {
        isActive: true,
        isVerified: true,
      },
    });

    res.json({
      success: true,
      message: "Expert approved",
      application,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Approve failed",
    });

  }
};



// REJECT
export const rejectApplication = async (
  req: Request,
  res: Response
) => {
  try {

    const application = await prisma.expertApplication.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.user.update({
      where: {
        email: application.email,
      },
      data: {
        isActive: false,
      },
    });

    res.json({
      success: true,
      message: "Expert rejected",
      application,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Reject failed",
    });

  }
};


// DELETE
export const deleteApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const application = await prisma.expertApplication.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Delete linked user
    await prisma.user.deleteMany({
      where: {
        email: application.email,
      },
    });

    // Delete application
    await prisma.expertApplication.delete({
      where: {
        id: application.id,
      },
    });

    return res.json({
      success: true,
      message: "Application deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

