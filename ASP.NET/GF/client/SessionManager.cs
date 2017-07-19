using System;
using System.Diagnostics;


#if NETFX_CORE
using Org.WebRtc;
using System.Threading.Tasks;
using Windows.Data.Json;
using WebRTCMedia = Org.WebRtc.Media;
#endif



namespace GiraffeXRUnityPlugin.Client
{
    public class SessionManager
    {
        // TODO: Implementing SessionManager code
#if NETFX_CORE
        //singleton
        private static Object _instanceLock = new Object();
        private Object _mediaLock = new object();
        private static SessionManager _instance;
        

        public const string LocalMediaStreamId = "LOCAL";
        public const string PeerMediaStreamId = "PEER";

        private WebSocketClient webSocketClient;
        private static String peerID = null;
        private String caller = null;
        private String sdpOffer = null;
        private int VideoCaptureWidth = 640;
        private int VideoCaptureHeight = 480;
        private int VideoCaptureFPS = 30;

        private Peer peerConnection;
        /// <summary>
        ///  The single instance of the Session Manager class.
        /// </summary>
        public static SessionManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_instanceLock)
                    {
                        if (_instance == null)
                        {
                            _instance = new SessionManager();
                        }
                    }
                }
                return _instance;
            }
        }

        //ID of this peer
        private static String myUniqueID = DeviceInfo.Instance.Id;
        public WebRTCMedia Media { get; private set; }

        private MediaStream _localStream;
        public MediaStream LocalStream
        {
            get { return _localStream; }
            set
            {
                _localStream = value;
                ApplyVideoConfig();
            }
        }

        

        /// <summary>
        /// Video codec used in WebRTC session.
        /// </summary>
        public CodecInfo VideoCodec { get; set; }

        /// <summary>
        /// Audio codec used in WebRTC session.
        /// </summary>
        public CodecInfo AudioCodec { get; set; }


        public SessionManager()
        {
            webSocketClient = new WebSocketClient(this);
            var task = webSocketClient.initializeWebSocket();
            Media = WebRTCMedia.CreateMedia();
            WebRTC.SetPreferredVideoCaptureFormat(VideoCaptureWidth, VideoCaptureHeight, VideoCaptureFPS);

            peerConnection = new Peer(this, webSocketClient, Media);
        }

        public void onSocketOpen()
        {
             loginAsync();
        }

        private void ApplyVideoConfig()
        {
            if (LocalStream != null)
            {
                foreach (var videoTrack in LocalStream.GetVideoTracks())
                {
                    videoTrack.Enabled = true;
                }
            }
        }
        
      
        public async void loginAsync()
        {

            String deviceName = DeviceInfo.Instance.Name;
            peerID = deviceName + myUniqueID;

            JsonObject jsonObject = new JsonObject();
            jsonObject["command"] = JsonValue.CreateStringValue("login");
            jsonObject["name"] = JsonValue.CreateStringValue(peerID);
            jsonObject["contactName"] = JsonValue.CreateStringValue(deviceName);

            await webSocketClient.sendMessage(jsonObject.Stringify());

            //events.onLogin();
           
        }
        
        // Implementing login 
      
        public  static string login()
        {
#if NETFX_CORE || UNITY_WINRT
            String deviceName = DeviceInfo.Instance.Name;
            peerID = deviceName + myUniqueID;

            JsonObject jsonObject = new JsonObject();
            jsonObject["command"] = JsonValue.CreateStringValue("login");
            jsonObject["name"] = JsonValue.CreateStringValue(peerID);
            jsonObject["contactName"] = JsonValue.CreateStringValue(deviceName);

           
            return jsonObject.Stringify();
#endif

        }




        public void onNewMemberAdded(String newMemberName)
        {
          
            Debug.WriteLine("Found New Member " + newMemberName);
            //events.onNewMemberAdded(newMemberName);
            
        }

       

        
        public void onOfferReceived(String sdpOffer, String from)
        {
            Debug.WriteLine("Requesting Peer to Create Answer");

            this.sdpOffer = sdpOffer;
            caller = from;

            peerConnection.CreateAnswer(sdpOffer, from).ConfigureAwait(continueOnCapturedContext : false);

            //events.onOfferRecieved(from);
        }

        public async void onAnswerRecieved(String answer)
        {
            Debug.WriteLine("Requesting Peer to Register Answer and Establish call");
            //Debug.WriteLine(answer);
            await peerConnection.onAnswerRecieved(answer);
        }

        public async Task onCandidateFound(String ICECandidate, int sdpMLineIdx, String sdpMid)
        {
            await peerConnection.addCandidate(ICECandidate, sdpMLineIdx, sdpMid)
                      .ConfigureAwait(continueOnCapturedContext : false);
        }

        public async Task CloseConnection()
        {
            await SendHangupMessage();
            Media.OnAppSuspending();
        }
            
        private async Task SendHangupMessage()
        {
            JsonObject jsonObject = new JsonObject();
            jsonObject["command"] = JsonValue.CreateStringValue("userDisconnected");
            jsonObject["name"] = JsonValue.CreateStringValue(peerID);

            await webSocketClient.sendMessage(jsonObject.Stringify());
        }

        /// <summary>
        /// Invoked when the remote peer added a media stream to the peer connection.
        /// </summary>
        public event Action<MediaStreamEvent> OnAddRemoteStream;
        public void PeerConnection_OnAddStream(MediaStreamEvent evt)
        {
            OnAddRemoteStream?.Invoke(evt);
        }

        public event Action<MediaStreamEvent> OnRemoveRemoteStream;
        private void PeerConnection_OnRemoveStream(MediaStreamEvent evt)
        {
            OnRemoveRemoteStream?.Invoke(evt);
        }

        public event Action<MediaStreamEvent> OnAddLocalStream;

        public async Task createOffer(String memberName)
        {
            await peerConnection.CreateOffer(memberName);
        }

        /// <summary>
        /// Calls to disconnect from peer.
        /// </summary>
        public async Task DisconnectFromPeer()
        {
            
            try
            {
                await ClosePeerConnection();
            }catch(Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
            finally
            {
                
                Debug.WriteLine("Connection Closed");
            }
        }

        /// <summary>
        /// Closes a peer connection.
        /// </summary>
        private async Task ClosePeerConnection()
        {
            lock (_mediaLock)
            {
                if (peerConnection != null)
                {
                    peerID = "";
                    peerConnection.CloseMediaStream();
                    

                    //peerConnection.Close(); // Slow, so do this after UI updated and camera turned off
                    peerConnection = null;
                    
                  
                    GC.Collect(); // Ensure all references are truly dropped.
                }
            }
        }
#endif

        //  Passing init WebRTC to pluging and login
        public static void WebRtcInitialize()
        {
#if NETFX_CORE || UNITY_WINRT
            Debug.WriteLine("[YES] NETFX_CORE || UNITY_WINRT");
            WebRTC.Initialize(null);
#else
            Debug.WriteLine("[NO] NETFX_CORE || UNITY_WINRT");
            throw new NotImplementedException("WebRtcInitialize() not implemented!");
#endif
        }

        public static void WebRtcLoginAsync()
        {
#if NETFX_CORE || UNITY_WINRT
            SessionManager.Instance.loginAsync();
#else
            throw new NotImplementedException("WebRtcLoginAsync() not implemented!");
#endif
        }
    }


}
