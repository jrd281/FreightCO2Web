import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError} from 'rxjs';
import { User } from 'app/modules/admin/apps/users/users.types';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UsersService
{
    // Private
    private _backendUrl: string =  environment.resourceServerUrl;
    private _user: BehaviorSubject<User | null> = new BehaviorSubject(null);
    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for user
     */
    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    /**
     * Getter for users
     */
    get users$(): Observable<User[]>
    {
        return this._users.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get users
     */
    getUsers(): Observable<User[]>
    {
        const endpoint = this._backendUrl + '/users';
        return this._httpClient.get<User[]>(endpoint).pipe(
            tap((response: any[]) => {
                const users = response[0] !== undefined ? response[0] : [];
                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                const compare = ({a, b}: { a: any; b: any }) => {
                    const aProperty = a.firstName !== undefined ? a.firstName.toUpperCase() : '';
                    const bProperty = b.firstName !== undefined ? b.firstName.toUpperCase() : '';
                    if (aProperty < bProperty) {
                        return -1;
                    }
                    if (aProperty > bProperty) {
                        return 1;
                    }
                    return 0;
                };

                users.sort(compare);
                this._users.next(users);
            }),
            catchError((httpResponse: HttpResponse<any>) => {
                const errorMessage = this.getErrorMessage(httpResponse);
                // Log the error
                console.error(errorMessage);

                // Throw an error
                return throwError(errorMessage);
            }),
        );
    }

    /**
     * Search users with given query
     *
     * @param query
     */
    searchUsers(query: string): Observable<User[]>
    {
        const endpoint = this._backendUrl + '/users/search';
        return this._httpClient.get<User[]>(endpoint, {
            params: {query}
        }).pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }

    /**
     * Get user by id
     */
    getUserById(id: string): Observable<User>
    {
        const endpoint = this._backendUrl + '/users/' + id;
        // @ts-ignore
        return this._httpClient.get<User[]>(endpoint).pipe(
            tap((response: any[]) => {
                const user = response[0] !== undefined ? response[0] : [];
                this._user.next(user);
            }),
            catchError((httpResponse: HttpResponse<any>) => {
                const errorMessage = this.getErrorMessage(httpResponse);
                // Log the error
                console.error(errorMessage);

                // Throw an error
                return throwError(errorMessage);
            }),
        );
    }

    /**
     * Create user
     */
    createUser(): Observable<User>
    {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.post<User>('api/apps/users/user', {}).pipe(
                map((newUser) => {

                    // Update the users with the new user
                    this._users.next([newUser, ...users]);

                    // Return the new user
                    return newUser;
                })
            ))
        );
    }

    /**
     * Update user
     *
     * @param id
     * @param user
     */
    updateUser(id: string, user: User): Observable<User>
    {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.patch<User>('api/apps/users/user', {
                id,
                user
            }).pipe(
                map((updatedUser) => {

                    // Find the index of the updated user
                    const index = users.findIndex(item => item.id === id);

                    // Update the user
                    users[index] = updatedUser;

                    // Update the users
                    this._users.next(users);

                    // Return the updated user
                    return updatedUser;
                }),
                switchMap(updatedUser => this.user$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the user if it's selected
                        this._user.next(updatedUser);

                        // Return the updated user
                        return updatedUser;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the user
     *
     * @param id
     */
    deleteUser(id: string): Observable<boolean>
    {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.delete('api/apps/users/user', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted user
                    const index = users.findIndex(item => item.id === id);

                    // Delete the user
                    users.splice(index, 1);

                    // Update the users
                    this._users.next(users);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Update the avatar of the given user
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, avatar: File): Observable<User>
    {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.post<User>('api/apps/users/avatar', {
                id,
                avatar
            }, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': avatar.type
                }
            }).pipe(
                map((updatedUser) => {

                    // Find the index of the updated user
                    const index = users.findIndex(item => item.id === id);

                    // Update the user
                    users[index] = updatedUser;

                    // Update the users
                    this._users.next(users);

                    // Return the updated user
                    return updatedUser;
                }),
                switchMap(updatedUser => this.user$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the user if it's selected
                        this._user.next(updatedUser);

                        // Return the updated user
                        return updatedUser;
                    })
                ))
            ))
        );
    }

    getErrorMessage(httpResponse: HttpResponse<any>): string {
        const errorArr = httpResponse['error'] ?? ['','Unknown Error'];
        let errorMessage = errorArr.length > 1 ? String(errorArr[1]) : '';

        // This is because a Cognito error will output the "AdminUserSet permissions...: User friendly error"
        errorMessage = errorMessage.indexOf(':') > -1 ? errorMessage.substr(errorMessage.indexOf(':')  + 1, errorMessage.length) : errorMessage;

        return errorMessage;
    }
}