import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
import {
  fontBold,
  fontBoldItalic, fontItalic, fontMedium, fontRegular, fontSemiBold, fontExtraBold
} from './customFont'

export const routeStyles = StyleSheet.create({
  flexContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  topLinksContent: {
    // height: (height * 8.4) / 100,
    height: 65,
    width: '100%',
    // backgroundColor: '#8BD9E1',
    backgroundColor: '#0B1437',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  topButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  topButton: {
    fontSize: 25,
    color: '#8e9ba4',
  },
  searchButton: {
    fontSize: 25,
    color: '#8e9ba4',
  },
  logo: {
    fontSize: 24,
    color: '#8e9ba4',
    ...fontBoldItalic
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 70,
    width: 70,
    borderRadius: 40,
    backgroundColor: '#00a884',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonA: {
    fontSize: 25,
    color: 'white',
  },
  listContainer: {
    width,
    height: '100%',
    backgroundColor: '#121b22',
  },
  chatBox: {
    width,
    height: 80,
    alignItems: 'center',
    zIndex: 1,
    flexDirection: 'row',
  },
  fotoButton: {
    zIndex: 2,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  chatInfo: {
    width: width - 80,
    height: '100%',
    paddingHorizontal: 7.5,
    paddingVertical: 10,
    justifyContent: 'center',

    gap: 5,
  },
  chatTopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chatName: {
    width: '70%',
    color: 'white',
    fontSize: 17,
    ...fontBold,
  },
  chatDate: {
    color: '#8e9ba4',
    fontSize: 10,
    ...fontRegular,
  },
  chatBottomInfo: {
    flexDirection: 'row',
      justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  chechMark: {
    color: '#2a9530',
    fontSize: 16,
  },
  message: {
    color: '#8e9ba4',
    fontSize: 16,
    marginLeft: 2,
    ...fontRegular
  },
  nomessage: {
    color: '#7c8890',
    fontSize: 16,
    marginLeft: 8,
    ...fontItalic,
  },
  chechMarkDone: {
    color: '#2a9530',
    fontSize: 16,
  },
  contactsContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#121b22',
    paddingLeft: 10,
  },
  contactsPopup: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    width: width,
    bottom: 0,
    backgroundColor: '#E0F6CA',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 10
  },
  contactsPopupBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  contactsBox: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactsFoto: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderColor: '#121b22',
    borderWidth: 2,
  },
  contactsCircle: {
    height: 64,
    width: 64,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsCircleOp: {
    height: 64,
    width: 64,
    borderRadius: 31,
    borderColor: '#121b22',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsDetails: {
    width: width - 150,
    height: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 20,
  },
  contactsName: {
    color: 'white',
    fontSize: 18,
    ...fontBold
  },
  contactsDate: {
    color: '#8e9ba4',
    fontSize: 14,
    ...fontMedium
  },
  addIconBox: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#00a884',
    position: 'absolute',
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#121b22',
    borderWidth: 2,
  },
  addIcon: {
    fontSize: 23,
    color: 'white',
  },
  checkIcon: {
    fontSize: 30,
    color: 'green',
  },
  editIconBox: {
    position: 'absolute',
    bottom: 20,
    right: 32,
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#233239',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: { fontSize: 25, color: 'white' },
  callDetail: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  getCallDetailIcon: {
    fontSize: 19,
    transform: [{ rotate: '45deg' }],
  },
  setCallDetailIcon: {
    fontSize: 19,
    transform: [{ rotate: '225deg' }],
  },
  callIcon: {
    color: '#00a884',
    fontSize: 20,
    right: 50,
  },
  callLink: {
    fontSize: 25,
    color: 'white',
    transform: [{ rotate: '45deg' }],
  },
  CallCircleOp: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#00a984',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataNotFound: {
    marginTop: 20,
    fontSize: 15,
    color: 'white',
    width: '100%',
    textAlign: 'center',
  },
  selectScreenContent: {
    flex: 1,
    width: '100%',
    paddingTop: 60,
  },
  deletedmessage: {
    fontSize: 12,
    color: '#8e9ba4',
    ...fontBoldItalic
  },
  cancelBtn: {
    color: 'black', 
    fontSize: 18, 
    ...fontSemiBold
  },
  contactCenter: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  contactFoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  contactName: {
    fontSize: 26,
    ...fontBold,
    marginTop: 16
  },
  itemSection: {
    padding: 20,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    margin: 10
  },
  contactLabel: {
    ...fontMedium,
  },
  contactInfo: {
    color: '#2887fc',
    ...fontBold,
    fontSize: 16
  },
  loadContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top:0,
    backgroundColor: '#0707075e',
    flex: 1,
    justifyContent: 'center',
    zIndex: 1000,
  },
  loaderStyle: {
    flex: 0, 
    width: 200, 
    height: 200, 
    backgroundColor: 'transparent'
  }
});
