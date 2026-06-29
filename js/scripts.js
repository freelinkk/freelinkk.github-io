
$(document).ready(function(){
        
    $('#content').load("new.html");

});

window.onload = function()
{
    const path = window.location.pathname.split("/");

    switch(path[1])
    {
        case "":
        {
            loadPage("freelink");
            break;
        }
        case "installation":
        {
            loadPage("installation");
            break;
        }
        case "performance":
        {
            loadPage("performance");
            break;
        }
        case "discography":
        {
            loadPage("discogprahy");
            break;
        }
        case "all":
        {
            loadPage("all");
            break;
        }
        case "about":
        {
            loadPage("about");
            break;
        }
        default:
        {
            loadPage("404");
            break;
        }
    }

    document.querySelectorAll(".menu__item").forEach((item) =>
    {
        item.addEventListener("click", function()
        {
            const path = item.getAttribute("value");
            loadPage(path);
            if(path == "freelink")
            {
                window.history.pushState("", "", "/");
                return;
            }

            window.history.pushState("", "", path);
        });
    });

    function loadPage($path)
    {
        if($path == "") return;

        const container = document.getElementById("container");

        const request = new XMLHttpRequest();
        request.open("GET", "pages/" + $path + ".html");
        request.send();
        request.onload = function()
        {
            if(request.status == 200)
            {
                container.innerHTML = request.responseText;
                document.title = $path;
            }
        }
    }
}


// window.onload = function()
// {
//     const path = window.location.pathname.split("/");

//     switch(path[])
//     {
//         case "":
//         {
//             loadPage("installation");
//             break;
//         }
//         case "oosterkerk":
//         {
//             loadPage("oosterkerk");
//             break;
//         }
//         default:
//         {
//             loadPage("404");
//             break;
//         }
//     }

//     document.querySelectorAll(".menu__item_in").forEach((item) =>
//     {
//         item.addEventListener("click", function()
//         {
//             const path = item.getAttribute("value");
//             loadPage(path);
//             if(path == "installation")
//             {
//                 window.history.pushState("", "", "/installation");
//                 return;
//             }

//             window.history.pushState("", "", path);
//         });
//     });

//     function loadPage($path)
//     {
//         if($path == "") return;

//         const container = document.getElementById("containerin");

//         const request = new XMLHttpRequest();
//         request.open("GET", "Files/performance" + $path + ".html");
//         request.send();
//         request.onload = function()
//         {
//             if(request.status == 200)
//             {
//                 containerin.innerHTML = request.responseText;
//                 document.title = $path;
//             }
//         }
//     }
// }
