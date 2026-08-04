import { Request, Response } from "express";
import { prisma } from "../prisma";


// ======================================
// CREATE ACCOUNT REQUEST
// Expert / Institution registration
// ======================================

export async function createRequest(
  req: Request,
  res: Response
) {
  try {

    const {
      type,
      email,
      fullName,
      data,
    } = req.body;


    if (!type || !email) {
      return res.status(400).json({
        success: false,
        message: "Type and email are required",
      });
    }


    const request =
      await prisma.accountRequest.create({
        data: {
          type,
          email,
          fullName,
          data,
        },
      });


    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request,
    });


  } catch (error) {

    console.error(
      "CREATE REQUEST ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
}




// ======================================
// GET ALL REQUESTS (ADMIN)
// ======================================

export async function getRequests(
  req: Request,
  res: Response
) {

  try {


    const requests =
      await prisma.accountRequest.findMany({

        orderBy: {
          createdAt: "desc",
        },

      });


    return res.json({
      success: true,
      requests,
    });



  } catch(error) {


    console.error(
      "GET REQUESTS ERROR:",
      error
    );


    return res.status(500).json({
      success:false,
      message:"Error fetching requests",
    });

  }

}





// ======================================
// GET REQUEST BY ID (ADMIN)
// ======================================

export async function getRequestById(
  req: Request,
  res: Response
) {

  try {


    const { id } = req.params;


    const request =
      await prisma.accountRequest.findUnique({

        where:{
          id: String(id),
        },

      });



    if(!request){

      return res.status(404).json({
        success:false,
        message:"Request not found",
      });

    }



    return res.json({
      success:true,
      request,
    });



  } catch(error) {


    console.error(
      "GET REQUEST BY ID ERROR:",
      error
    );


    return res.status(500).json({
      success:false,
      message:"Server error",
    });

  }

}







// ======================================
// APPROVE REQUEST
// ======================================

export async function approveRequest(
  req: Request,
  res: Response
) {

  try {


    const { id } = req.params;


    const request =
      await prisma.accountRequest.update({

        where:{
          id:String(id),
        },


        data:{
          status:"APPROVED",
          reviewedAt:new Date(),
        },

      });



    return res.json({

      success:true,

      message:"Request approved",

      request,

    });



  } catch(error) {


    console.error(
      "APPROVE ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:"Approve failed",

    });

  }

}







// ======================================
// REJECT REQUEST
// ======================================

export async function rejectRequest(
  req: Request,
  res: Response
) {

  try {


    const { id } = req.params;



    const request =
      await prisma.accountRequest.update({

        where:{
          id:String(id),
        },


        data:{
          status:"REJECTED",
          reviewedAt:new Date(),
        },

      });



    return res.json({

      success:true,

      message:"Request rejected",

      request,

    });



  } catch(error) {


    console.error(
      "REJECT ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:"Reject failed",

    });

  }

}
export async function deleteRequest(
  req: Request,
  res: Response
) {
  try {

    const { id } = req.params;


    await prisma.accountRequest.delete({
      where:{
        id:String(id)
      }
    });


    return res.json({
      success:true,
      message:"Request deleted"
    });


  } catch(error){

    console.error(error);

    return res.status(500).json({
      success:false,
      message:"Delete failed"
    });

  }
}