import express, { Router } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { AddBasicInfo } from '@user/controllers/user/add/add-basic-info';
import { AddDetails } from '@user/controllers/user/add/add-details';
import { AddPlacesLived } from '@user/controllers/user/add/add-places';
import { AddWorkAndEducation } from '@user/controllers/user/add/add-work-and-education';
import { DeletePlacesLived } from '@user/controllers/user/delete/delete-places';
import { DeleteWorkAndEducation } from '@user/controllers/user/delete/delete-work-and-education';
import { EditPlacesLived } from '@user/controllers/user/edit/edit-places';
import { EditWorkAndEducation } from '@user/controllers/user/edit/edit-work-and-education';
import { GetUser } from '@user/controllers/user/get-profile';
import { ChangePassword } from '@user/controllers/user/edit/change-password';
import { Settings } from '@user/controllers/user/edit/update-settings';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/auth/all/:page', authMiddleware.checkAuthentication, GetUser.prototype.all);
    this.router.get('/user/profile', authMiddleware.checkAuthentication, GetUser.prototype.profile);
    this.router.get('/user/profile/user/:username/:userId/:uId', authMiddleware.checkAuthentication, GetUser.prototype.username);

    this.router.post('/user/profile/work', authMiddleware.checkAuthentication, AddWorkAndEducation.prototype.work);
    this.router.post('/user/profile/school', authMiddleware.checkAuthentication, AddWorkAndEducation.prototype.education);
    this.router.post('/user/profile/gender', authMiddleware.checkAuthentication, AddBasicInfo.prototype.gender);
    this.router.post('/user/profile/birthday', authMiddleware.checkAuthentication, AddBasicInfo.prototype.birthday);
    this.router.post('/user/profile/relationship', authMiddleware.checkAuthentication, AddBasicInfo.prototype.relationship);
    this.router.post('/user/profile/about', authMiddleware.checkAuthentication, AddDetails.prototype.about);
    this.router.post('/user/profile/quotes', authMiddleware.checkAuthentication, AddDetails.prototype.quotes);
    this.router.post('/user/profile/places', authMiddleware.checkAuthentication, AddPlacesLived.prototype.places);

    // edit
    this.router.put('/user/profile/work/:workId', authMiddleware.checkAuthentication, EditWorkAndEducation.prototype.work);
    this.router.put('/user/profile/school/:schoolId', authMiddleware.checkAuthentication, EditWorkAndEducation.prototype.education);
    this.router.put('/user/profile/places/:placeId', authMiddleware.checkAuthentication, EditPlacesLived.prototype.places);
    this.router.put('/user/profile/change-password', authMiddleware.checkAuthentication, ChangePassword.prototype.update);
    this.router.put('/user/profile/settings', authMiddleware.checkAuthentication, Settings.prototype.update);

    // delete
    this.router.delete('/user/profile/work/:workId', authMiddleware.checkAuthentication, DeleteWorkAndEducation.prototype.work);
    this.router.delete('/user/profile/school/:schoolId', authMiddleware.checkAuthentication, DeleteWorkAndEducation.prototype.education);
    this.router.delete('/user/profile/places/:placeId', authMiddleware.checkAuthentication, DeletePlacesLived.prototype.places);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
