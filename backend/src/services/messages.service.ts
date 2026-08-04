import { prisma } from "../prisma";


// Get people available for messaging
export async function getUsersForMessaging(
  currentUserId: string
) {

  const users = await prisma.user.findMany({

    where:{
      id:{
        not: currentUserId
      },

      isActive:true
    },

    select:{
      id:true,
      name:true,
      email:true,
      role:true,
      avatarUrl:true,
      bio:true
    },

    orderBy:{
      name:"asc"
    }

  });


  return users;

}




// Create or find conversation
async function getOrCreateConversation(
  user1:string,
  user2:string
){

  let conversation =
    await prisma.conversation.findFirst({

      where:{
        participants:{
          some:{
            id:user1
          }
        },

        AND:{
          participants:{
            some:{
              id:user2
            }
          }
        }
      }

    });



  if(!conversation){

    conversation =
      await prisma.conversation.create({

        data:{

          participants:{
            connect:[
              {
                id:user1
              },
              {
                id:user2
              }
            ]
          }

        }

      });

  }



  return conversation;

}





// Send message
export async function sendMessage(
senderId:string,
receiverId:string,
content:string
){


if(!content.trim()){

 throw new Error(
  "Message cannot be empty"
 );

}



const conversation =
 await getOrCreateConversation(
  senderId,
  receiverId
 );



const message =
 await prisma.message.create({

  data:{

    conversationId:
    conversation.id,

    senderId,

    receiverId,

    content

  },


  include:{

    sender:{
      select:{
        id:true,
        name:true,
        avatarUrl:true
      }
    },

    receiver:{
      select:{
        id:true,
        name:true,
        avatarUrl:true
      }
    }

  }

 });



return message;

}





// Get conversation messages
export async function getConversationMessages(
userId:string,
otherUserId:string
){


const conversation =
await prisma.conversation.findFirst({

where:{


participants:{


some:{
id:userId
}


},


AND:{


participants:{
some:{
id:otherUserId
}
}


}


}


});



if(!conversation){

return [];

}



return prisma.message.findMany({

where:{
conversationId:conversation.id
},


orderBy:{
createdAt:"asc"
},


include:{


sender:{
select:{
id:true,
name:true,
avatarUrl:true
}
},


receiver:{
select:{
id:true,
name:true
}
}


}


});


}