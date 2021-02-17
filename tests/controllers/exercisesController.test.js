/* eslint-disable no-undef */
require('dotenv').config();

const exercisesController = require('../../src/controllers/exercisesController');
const topicsController = require('../../src/controllers/topicsController');
const chaptersController = require('../../src/controllers/chaptersController');
const NotFoundError = require('../../src/errors/NotFoundError');

afterEach(() => jest.restoreAllMocks());

describe('function editExercise', () => {
  it("should edit exercise's topic if sent topicId is different than before and update chapter's exercises quantity if exercise belongs to a new chapter", async () => {
    const id = 1;
    const topicId = 1;
    const description = 'Teste';

    jest.spyOn(exercisesController, 'getOne');
    const mockedTopicFn = jest.spyOn(topicsController, 'getOne');
    const mockedChapterFn = jest.spyOn(chaptersController, 'changeExerciseQuantity');
    exercisesController.getOne.mockResolvedValueOnce({ topicId: 2, save: () => true });
    topicsController.getOne.mockResolvedValueOnce({ chapterId: 1 });
    topicsController.getOne.mockResolvedValueOnce({ chapterId: 2 });
    chaptersController.changeExerciseQuantity.mockResolvedValue(true);

    const response = await exercisesController.editExercise({ id, topicId, description });

    expect(mockedTopicFn).toHaveBeenCalledTimes(2);
    expect(mockedTopicFn).toHaveBeenNthCalledWith(1, 2);
    expect(mockedTopicFn).toHaveBeenLastCalledWith(1);
    expect(mockedChapterFn).toHaveBeenCalledTimes(2);
    expect(mockedChapterFn).toHaveBeenNthCalledWith(1, 1, 'minus');
    expect(mockedChapterFn).toHaveBeenLastCalledWith(2, 'plus');
    expect(response).toEqual(
      expect.objectContaining({
        topicId,
        description,
      }),
    );
  });

  it("should edit exercise's topic if sent topicId is different than before and do not update its chapter's exercises quantity if new topic belongs to the same chapter that before one did", async () => {
    const id = 1;
    const topicId = 1;
    const description = 'Teste';

    jest.spyOn(exercisesController, 'getOne');
    const mockedTopicFn = jest.spyOn(topicsController, 'getOne');
    const mockedChapterFn = jest.spyOn(chaptersController, 'changeExerciseQuantity');
    exercisesController.getOne.mockResolvedValueOnce({ topicId: 2, save: () => true });
    topicsController.getOne.mockResolvedValue({ chapterId: 1 });

    const response = await exercisesController.editExercise({ id, topicId, description });

    expect(mockedTopicFn).toHaveBeenCalledTimes(2);
    expect(mockedTopicFn).toHaveBeenNthCalledWith(1, 2);
    expect(mockedTopicFn).toHaveBeenLastCalledWith(1);
    expect(mockedChapterFn).not.toHaveBeenCalled();
    expect(response).toEqual(
      expect.objectContaining({
        topicId,
        description,
      }),
    );
  });

  it('should update exercise data with sent values with no other changes if sent topicId is the same than before', async () => {
    const id = 1;
    const topicId = 1;
    const description = 'Teste';

    jest.spyOn(exercisesController, 'getOne');
    const mockedTopicFn = jest.spyOn(topicsController, 'getOne');
    exercisesController.getOne.mockResolvedValueOnce({ topicId: 1, save: () => true });

    const response = await exercisesController.editExercise({ id, topicId, description });

    expect(mockedTopicFn).not.toHaveBeenCalled();
    expect(response).toEqual(
      expect.objectContaining({
        topicId,
        description,
      }),
    );
  });

  it('should throw NotFoundError if sent id is invalid', async () => {
    const id = 1;
    const topicId = 1;
    const description = 'Teste';

    jest.spyOn(exercisesController, 'getOne');
    exercisesController.getOne.mockResolvedValueOnce(null);

    const testFn = exercisesController.editExercise({ id, topicId, description });

    expect(testFn).rejects.toThrow(NotFoundError);
  });
});
